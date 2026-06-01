#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script pour créer un superuser VIDMED
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vidmed_project.settings')
sys.path.insert(0, os.path.dirname(__file__))

# Setup Django
django.setup()

from vidmed_project.core.models import User, Clinic

def create_superuser():
    """Créer un superuser avec des credentials par défaut"""

    print("=" * 60)
    print("CRÉATION SUPERUSER VIDMED")
    print("=" * 60)

    # Vérifier si un superuser existe déjà
    if User.objects.filter(is_superuser=True).exists():
        print("\n⚠️  Un superuser existe déjà!")
        response = input("Voulez-vous en créer un autre? (o/N): ")
        if response.lower() != 'o':
            print("Annulé.")
            return

    # Récupérer les informations
    print("\n📝 Informations du superuser:")
    username = input("Username (défaut: admin): ").strip() or "admin"
    email = input("Email (défaut: admin@vidmed.com): ").strip() or "admin@vidmed.com"
    first_name = input("Prénom (défaut: Admin): ").strip() or "Admin"
    last_name = input("Nom (défaut: VIDMED): ").strip() or "VIDMED"

    # Mot de passe
    import getpass
    while True:
        password = getpass.getpass("Mot de passe (min 8 caractères): ")
        if len(password) < 8:
            print("❌ Le mot de passe doit contenir au moins 8 caractères!")
            continue

        password_confirm = getpass.getpass("Confirmez le mot de passe: ")
        if password != password_confirm:
            print("❌ Les mots de passe ne correspondent pas!")
            continue

        break

    # Créer ou récupérer la clinique par défaut
    clinic, created = Clinic.objects.get_or_create(
        name="Clinique VIDMED Principal",
        defaults={
            'address': 'Port-au-Prince, Haïti',
            'phone': '+509 1234-5678',
            'email': 'contact@vidmed.com',
        }
    )

    if created:
        print(f"\n✅ Clinique '{clinic.name}' créée")
    else:
        print(f"\n✅ Clinique '{clinic.name}' existante")

    # Créer le superuser
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='GRAND_SUPERUSER',
            clinic=clinic,
        )

        print("\n" + "=" * 60)
        print("✅ SUPERUSER CRÉÉ AVEC SUCCÈS!")
        print("=" * 60)
        print(f"\nUsername:     {user.username}")
        print(f"Email:        {user.email}")
        print(f"Nom complet:  {user.get_full_name()}")
        print(f"Rôle:         {user.get_role_display()}")
        print(f"Clinique:     {user.clinic.name}")
        print(f"Superuser:    Oui")
        print(f"Staff:        Oui")
        print("\n🔐 Vous pouvez maintenant vous connecter avec ces identifiants.")
        print("\n📱 URLs:")
        print("  - Admin Django:  http://localhost:8000/admin/")
        print("  - API:           http://localhost:8000/api/")
        print("  - Frontend:      http://localhost:5173/")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ ERREUR lors de la création: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_superuser()
