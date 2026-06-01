#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script pour créer le superuser VIDMED automatiquement
Username: jeansuzanmarc
Email: jeansuzanmarc@gmail.com
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

def create_admin():
    """Créer le superuser admin avec credentials prédéfinis"""

    print("=" * 60)
    print("CRÉATION SUPERUSER VIDMED")
    print("=" * 60)

    # Vérifier si l'utilisateur existe déjà
    if User.objects.filter(username='jeansuzanmarc').exists():
        print("\n✅ L'utilisateur 'jeansuzanmarc' existe déjà!")
        user = User.objects.get(username='jeansuzanmarc')
        print(f"\nUsername:     {user.username}")
        print(f"Email:        {user.email}")
        print(f"Rôle:         {user.get_role_display()}")
        print(f"Superuser:    {'Oui' if user.is_superuser else 'Non'}")
        return

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
            username='jeansuzanmarc',
            email='jeansuzanmarc@gmail.com',
            password='jeansuzanmarc',
            first_name='Jean Suzan',
            last_name='Marc',
            role='GRAND_SUPERUSER',
            clinic=clinic,
        )

        print("\n" + "=" * 60)
        print("✅ SUPERUSER CRÉÉ AVEC SUCCÈS!")
        print("=" * 60)
        print(f"\nUsername:     {user.username}")
        print(f"Password:     jeansuzanmarc")
        print(f"Email:        {user.email}")
        print(f"Nom complet:  {user.get_full_name()}")
        print(f"Rôle:         {user.get_role_display()}")
        print(f"Clinique:     {user.clinic.name}")
        print(f"Superuser:    Oui")
        print(f"Staff:        Oui")
        print("\n🔐 Vous pouvez maintenant vous connecter avec:")
        print("   Username: jeansuzanmarc")
        print("   Password: jeansuzanmarc")
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
    create_admin()
