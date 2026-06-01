from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE OR REPLACE VIEW cash_flow_view AS

            -- Revenus des rapports journaliers (consultations)
            SELECT
                'revenue' as source,
                'consultation' as source_detail,
                dr.id as source_id,
                dr.clinic_id,
                dr.report_date as transaction_date,
                (SELECT id FROM account_codes WHERE code = 'REV_CONSULTATION' LIMIT 1) as account_code_id,
                'in' as flow_type,
                dr.consultations as amount,
                dr.submitted_by_id as user_id,
                dr.notes as description,
                dr.created_at
            FROM daily_reports dr
            WHERE dr.consultations > 0 AND dr.deleted_at IS NULL

            UNION ALL

            -- Revenus pharmacie
            SELECT
                'revenue',
                'pharmacy',
                dr.id,
                dr.clinic_id,
                dr.report_date,
                (SELECT id FROM account_codes WHERE code = 'REV_PHARMACIE' LIMIT 1),
                'in',
                dr.medicines,
                dr.submitted_by_id,
                dr.notes,
                dr.created_at
            FROM daily_reports dr
            WHERE dr.medicines > 0 AND dr.deleted_at IS NULL

            UNION ALL

            -- Revenus laboratoire
            SELECT
                'revenue',
                'laboratory',
                dr.id,
                dr.clinic_id,
                dr.report_date,
                (SELECT id FROM account_codes WHERE code = 'REV_LABORATOIRE' LIMIT 1),
                'in',
                dr.laboratory,
                dr.submitted_by_id,
                dr.notes,
                dr.created_at
            FROM daily_reports dr
            WHERE dr.laboratory > 0 AND dr.deleted_at IS NULL

            UNION ALL

            -- Revenus radiologie
            SELECT
                'revenue',
                'radiology',
                dr.id,
                dr.clinic_id,
                dr.report_date,
                (SELECT id FROM account_codes WHERE code = 'REV_RADIOLOGIE' LIMIT 1),
                'in',
                dr.radiology,
                dr.submitted_by_id,
                dr.notes,
                dr.created_at
            FROM daily_reports dr
            WHERE dr.radiology > 0 AND dr.deleted_at IS NULL

            UNION ALL

            -- Revenus chirurgie
            SELECT
                'revenue',
                'surgery',
                dr.id,
                dr.clinic_id,
                dr.report_date,
                (SELECT id FROM account_codes WHERE code = 'REV_CHIRURGIE' LIMIT 1),
                'in',
                dr.surgery,
                dr.submitted_by_id,
                dr.notes,
                dr.created_at
            FROM daily_reports dr
            WHERE dr.surgery > 0 AND dr.deleted_at IS NULL

            UNION ALL

            -- Autres revenus
            SELECT
                'revenue',
                'other',
                dr.id,
                dr.clinic_id,
                dr.report_date,
                (SELECT id FROM account_codes WHERE code = 'REV_AUTRE' LIMIT 1),
                'in',
                dr.other_revenue,
                dr.submitted_by_id,
                dr.notes,
                dr.created_at
            FROM daily_reports dr
            WHERE dr.other_revenue > 0 AND dr.deleted_at IS NULL

            UNION ALL

            -- Dépenses
            SELECT
                'expense',
                'expense',
                e.id,
                e.clinic_id,
                e.expense_date,
                e.account_code_id,
                'out',
                e.amount,
                e.recorded_by_id,
                e.description,
                e.created_at
            FROM expenses e
            WHERE e.deleted_at IS NULL

            UNION ALL

            -- Paiements de dettes patients (entrée)
            SELECT
                'debt_payment',
                'patient_debt',
                dp.id,
                d.clinic_id,
                dp.payment_date,
                (SELECT id FROM account_codes WHERE code = 'REC_DETTE' LIMIT 1),
                'in',
                dp.amount,
                dp.recorded_by_id,
                CONCAT('Paiement dette: ', d.debtor_name, ' - ', dp.notes),
                dp.created_at
            FROM debt_payments dp
            JOIN patient_debts d ON dp.debt_id = d.id
            WHERE d.deleted_at IS NULL

            UNION ALL

            -- Paiements de dettes entreprise (sortie)
            SELECT
                'company_debt_payment',
                'company_debt',
                cdp.id,
                cd.clinic_id,
                cdp.payment_date,
                (SELECT id FROM account_codes WHERE code = 'FRN_FOURNISSEUR' LIMIT 1),
                'out',
                cdp.amount,
                cdp.recorded_by_id,
                CONCAT('Paiement dette entreprise: ', cd.creditor_name, ' - ', cdp.notes),
                cdp.created_at
            FROM company_debt_payments cdp
            JOIN company_debts cd ON cdp.company_debt_id = cd.id
            WHERE cd.deleted_at IS NULL

            UNION ALL

            -- Transactions propriétaire (apports = entrée, retraits = sortie)
            SELECT
                'owner_transaction',
                ot.transaction_type,
                ot.id,
                ot.clinic_id,
                ot.transaction_date,
                CASE
                    WHEN ot.transaction_type = 'contribution'
                    THEN (SELECT id FROM account_codes WHERE code = 'CAP_APPORT' LIMIT 1)
                    ELSE (SELECT id FROM account_codes WHERE code = 'CAP_RETRAIT' LIMIT 1)
                END,
                CASE
                    WHEN ot.transaction_type = 'contribution' THEN 'in'
                    ELSE 'out'
                END,
                ot.amount,
                ot.recorded_by_id,
                ot.description,
                ot.created_at
            FROM owner_transactions ot

            ORDER BY transaction_date DESC, created_at DESC;
            """,
            reverse_sql="DROP VIEW IF EXISTS cash_flow_view;"
        ),
    ]
