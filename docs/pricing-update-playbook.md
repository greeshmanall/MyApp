# Pricing Update Playbook (Monthly)

1. Collect latest list pricing for:
   - AWS GPU instances
   - Google Cloud GPU VM families
   - CoreWeave equivalent GPU offerings
   - RunPod comparable GPU pods
2. Update `data/pricing/catalog.usd.json`.
3. Update `data/pricing/catalog.meta.json` fields:
   - `catalogVersion` (YYYY-MM)
   - `refreshedAt` (ISO timestamp)
   - `sourceNotes` with data source references
4. Run:

   ```bash
   npm run test
   ```

5. Sanity-check at least three scenarios in the UI and verify ranking changes are expected.
