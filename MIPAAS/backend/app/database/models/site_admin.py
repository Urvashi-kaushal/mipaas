"""Tables for the admin portal: admin accounts and the show/hide switches."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database.models import Base


def _now():
    return datetime.now(timezone.utc)


class AdminAccount(Base):
    """An admin who can sign in to the admin portal. Passwords are stored hashed, never as text."""

    __tablename__ = "site_admins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_id = Column(String(64), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)


class SiteSetting(Base):
    """One show/hide switch for a part of the website."""

    __tablename__ = "site_settings"

    key = Column(String(64), primary_key=True)
    label = Column(String(120), nullable=False)
    description = Column(String(255), default="")
    group_name = Column(String(64), default="General")
    visible = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)
    updated_by = Column(String(64), nullable=True)