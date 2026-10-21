# Taiwan AMR Atlas

Interactive single-page public-health dashboard prototype sourced from Taiwan CDC Antimicrobial Resistance Surveillance Annual Reports 2022–2024, Table 2-1. This prototype reports national isolate counts, not resistance proportions. Cross-year differences can reflect participation and case-definition changes.

## GitHub Pages
Go to Settings > Pages > Build and deployment > Deploy from a branch; choose main and / (root), then Save. Expected URL: https://cdcamr.github.io/taiwan-amr-atlas/

## Data and limitations
Static CSV resources: data/counts.csv and data/summary.csv. The page includes its own identical dataset for standalone use. This is NOT a server REST API, nor a live WHO GLASS integration. Chat is a rule-based FAQ. The 2022 vs later edition organism definitions and reporting counts differ. No clinical prescription guidance. Original government annual reports should be cited for use.

## Files
index.html (standalone dashboard), data/*.csv (downloadable datasets).

## 2026-10-21 verification update

- Cross-checked 2022, 2023, and 2024 edition Table 2-1 national top-10 organism counts and totals against source PDFs. Edition snapshot totals: 616,692; 645,375; 755,833.
- Added `data/longitudinal_2024.csv`: 2019 through 2024 historical totals as printed together in the **2024 report edition** Table 2-1 (p. 14): 603,463; 591,201; 628,659; 653,415; 729,812; 755,833. This intentionally differs from 2022/2023 *publication snapshots* because editions use different data extractions and inclusion scopes.
- WHO GLASS numerical comparisons are not yet populated. The international module is a comparison-method note and external reference links, not a verified international ranking.
- Publishing the sources is not the same as confirming successful GitHub Pages propagation; check the public URL after each push.
