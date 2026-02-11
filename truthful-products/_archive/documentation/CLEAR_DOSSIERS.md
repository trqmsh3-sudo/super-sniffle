# How to Clear All Dossiers (to Rebuild with Images)

## Option 1: Using Admin API Endpoint (After Deploy)

Once the backend is deployed with the latest code:

```bash
curl -X POST https://clearpick-ai.onrender.com/api/admin/clear-dossiers
```

This will delete all dossiers, keeping products in the database.

## Option 2: Using SQL Directly (If you have database access)

Run this SQL query on your production database:

```sql
DELETE FROM dossiers;
```

This will delete all dossiers, keeping products in the database.

## Option 3: Using Script (Local)

If you have the production DATABASE_URL:

```bash
cd backend
DATABASE_URL=<your_production_db_url> node scripts/clear-dossiers.js
```

## After Clearing

Once dossiers are deleted, when users search for products, they will be rebuilt with images automatically using `POST /api/products/build`.
