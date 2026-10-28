"""
Create (or reset the password of) an admin for the admin portal.

Run from the backend folder, in the same Python environment as the backend:
    python seed_admin.py
The password is typed into the terminal and stored hashed in the database.
"""

import getpass
import sys

from werkzeug.security import generate_password_hash

from app.database.models.site_admin import AdminAccount
from app.database.session import get_db, init_db


def main():
    init_db()
    admin_id = input("Admin ID: ").strip()
    if len(admin_id) < 3:
        sys.exit("The admin ID must be at least 3 characters.")
    password = getpass.getpass("Password (at least 10 characters): ")
    if len(password) < 10:
        sys.exit("The password must be at least 10 characters.")
    if password != getpass.getpass("Repeat password: "):
        sys.exit("The passwords do not match.")

    with get_db() as db:
        admin = db.query(AdminAccount).filter(AdminAccount.admin_id == admin_id).first()
        if admin:
            admin.password_hash = generate_password_hash(password)
            result = "updated"
        else:
            db.add(AdminAccount(admin_id=admin_id, password_hash=generate_password_hash(password)))
            result = "created"
    print(f"Admin '{admin_id}' {result}.")


if __name__ == "__main__":
    main()