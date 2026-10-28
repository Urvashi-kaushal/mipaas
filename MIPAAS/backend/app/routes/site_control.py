"""
Site control routes: admin login (ID and password stored in the database)
and show/hide switches for parts of the website.

  GET  /api/v1/site/settings          public, returns {key: true/false}
  POST /api/v1/admin/login            {admin_id, password} -> signed token
  GET  /api/v1/admin/settings         admin token required, full list
  PUT  /api/v1/admin/settings/<key>   admin token required, {visible: true/false}
"""

import os
import secrets
import time
from datetime import datetime, timezone
from functools import wraps

import structlog
from flask import Blueprint, g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from sqlalchemy import func
from werkzeug.security import check_password_hash, generate_password_hash

from app.database.models.site_admin import AdminAccount, SiteSetting
from app.database.session import get_db

logger = structlog.get_logger()
site_bp = Blueprint("site_control", __name__)

TOKEN_TTL = 8 * 60 * 60  # admin sessions last 8 hours
MAX_FAILS, FAIL_WINDOW = 5, 15 * 60  # 5 wrong passwords, then locked for 15 minutes

# key, label, group, description
DEFAULTS = [
    ("section_partners", "Partners strip", "Home page sections", "Row of names under the hero"),
    ("section_pathways", "Pathways section", "Home page sections", "Expanding cards for the AI pathways"),
    ("section_impact", "Impact section", "Home page sections", "Vision and roadmap panels"),
    ("section_developments", "Developments section", "Home page sections", "Latest developments cards"),
    ("section_testimonials", "Testimonials section", "Home page sections", "Quotes and feedback"),
    ("nav_eka", "Eka.care Hub link", "Navigation links", "Link in the top navigation bar"),
    ("nav_openemr", "OpenEMR Hub link", "Navigation links", "Link in the top navigation bar"),
    ("nav_agents", "Agents link", "Navigation links", "Link in the top navigation bar"),
    ("banner_announcement", "Announcement banner", "Banner", "Banner at the very top of the site"),
    ("pathway_lung_cancer", "Lung cancer AI", "Pathways", "Route /lung-cancer"),
    ("pathway_cardiac", "Cardiac AI", "Pathways", "Route /cardiac"),
    ("pathway_brain_tumor", "Brain tumour AI", "Pathways", "Route /brain-tumor"),
    ("pathway_qxr", "Chest X-ray AI", "Pathways", "Route /qxr"),
    ("pathway_stroke", "Stroke care AI", "Pathways", "Route /stroke"),
    ("pathway_tb", "Tuberculosis monitoring", "Pathways", "Route /tb"),
    ("pathway_qer", "Emergency radiology AI", "Pathways", "Route /qer"),
    ("pathway_skin_cancer", "Skin lesion AI", "Pathways", "Route /skin-cancer"),
    ("pathway_diabetic_foot", "Diabetic foot AI", "Pathways", "Route /diabetic-foot"),
]

_FALLBACK_SECRET = secrets.token_hex(32)
_DUMMY_HASH = generate_password_hash("not-a-real-password")
_FAILS: dict = {}


def _ok(data, status=200):
    return jsonify({"data": data}), status


def _err(message, status):
    return jsonify({"error": message}), status


def _serializer():
    secret = os.getenv("ADMIN_TOKEN_SECRET")
    if not secret:
        logger.warning("admin_token_secret_missing", hint="Set ADMIN_TOKEN_SECRET in the backend .env file")
        secret = _FALLBACK_SECRET  # random per start, so admins must sign in again after a restart
    return URLSafeTimedSerializer(secret, salt="mipaas-site-admin")


def require_site_admin(f):
    """Only lets a request through if it carries a valid, unexpired admin token."""

    @wraps(f)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = header[7:].strip() if header.startswith("Bearer ") else ""
        try:
            data = _serializer().loads(token, max_age=TOKEN_TTL)
        except (BadSignature, SignatureExpired):
            return _err("Admin sign-in required.", 401)
        if data.get("scope") != "site_admin":
            return _err("Admin sign-in required.", 401)
        g.site_admin = data["admin_id"]
        return f(*args, **kwargs)

    return wrapper


def _ensure_defaults(db):
    existing = {row[0] for row in db.query(SiteSetting.key).all()}
    for order, (key, label, group, desc) in enumerate(DEFAULTS):
        if key not in existing:
            db.add(SiteSetting(key=key, label=label, group_name=group, description=desc, visible=True, sort_order=order))
    db.flush()


def _as_dict(s):
    return {"key": s.key, "label": s.label, "description": s.description or "", "group": s.group_name or "General", "visible": bool(s.visible)}


def _blocked(key):
    now = time.time()
    recent = [t for t in _FAILS.get(key, []) if now - t < FAIL_WINDOW]
    _FAILS[key] = recent
    return len(recent) >= MAX_FAILS


@site_bp.route("/site/settings", methods=["GET"])
def public_settings():
    """Public: which parts of the site are switched on."""
    with get_db() as db:
        _ensure_defaults(db)
        rows = db.query(SiteSetting).all()
        return _ok({"settings": {r.key: bool(r.visible) for r in rows}})


@site_bp.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    admin_id = str(data.get("admin_id", "")).strip()
    password = str(data.get("password", ""))
    if not admin_id or not password:
        return _err("Enter your admin ID and password.", 400)

    limiter_key = f"{admin_id.lower()}|{request.remote_addr}"
    if _blocked(limiter_key):
        return _err("Too many failed attempts. Please try again in 15 minutes.", 429)

    with get_db() as db:
        admin = db.query(AdminAccount).filter(func.lower(AdminAccount.admin_id) == admin_id.lower()).first()
        # Always check a hash, so a wrong ID and a wrong password take the same time
        valid = check_password_hash(admin.password_hash if admin else _DUMMY_HASH, password) and admin is not None
        if not valid:
            _FAILS.setdefault(limiter_key, []).append(time.time())
            logger.warning("admin_login_failed", admin_id=admin_id, ip=request.remote_addr)
            return _err("Invalid admin ID or password.", 401)
        admin.last_login_at = datetime.now(timezone.utc)
        name = admin.admin_id

    _FAILS.pop(limiter_key, None)
    token = _serializer().dumps({"scope": "site_admin", "admin_id": name})
    logger.info("admin_login_ok", admin_id=name)
    return _ok({"token": token, "admin_id": name, "expires_in": TOKEN_TTL})


@site_bp.route("/admin/settings", methods=["GET"])
@require_site_admin
def admin_list_settings():
    with get_db() as db:
        _ensure_defaults(db)
        rows = db.query(SiteSetting).order_by(SiteSetting.sort_order).all()
        return _ok({"settings": [_as_dict(r) for r in rows]})


@site_bp.route("/admin/settings/<key>", methods=["PUT"])
@require_site_admin
def admin_update_setting(key):
    data = request.get_json(silent=True) or {}
    if not isinstance(data.get("visible"), bool):
        return _err("'visible' must be true or false.", 400)
    with get_db() as db:
        row = db.query(SiteSetting).filter(SiteSetting.key == key).first()
        if not row:
            return _err(f"Unknown setting '{key}'.", 404)
        row.visible = data["visible"]
        row.updated_by = g.site_admin
        logger.info("site_setting_changed", key=key, visible=row.visible, admin=g.site_admin)
        return _ok({"setting": _as_dict(row)})