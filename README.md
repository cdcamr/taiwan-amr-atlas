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

## AU / HAI / cross-domain / international explorer update (2026-10-21)

The homepage includes five additional interactive modules: AU antibiotic use, HAI healthcare-associated infections, cross-sector comparison, international indicator alignment, and a research configuration/share workbench.

**Authoritative source catalogs:**
- Taiwan CDC antibiotic use and resistance reports: https://www.cdc.gov.tw/Category/Page/tx7G1t-G3lyodZ8m8uoYMA
- Taiwan CDC healthcare-associated infection surveillance annual reports: https://www.cdc.gov.tw/Category/MPage/4G8HuDdUN1k4xaBJhbPzKQ
- WHO GLASS: https://worldhealthorg.shinyapps.io/glass-dashboard/

**Data integrity:** These modules presently expose year and metric selection, source links, definitions and comparison checklists. They do not yet present verified AU or HAI numerical time-series, WHO country comparisons, cross-sector correlation coefficients or an operational live API. The official source catalogs contain 2023 and 2024 AU reports and 2022–2024 HAI annual reports; numerators, denominators, unit consistency and exact source pages must be verified before numeric import. The comparison checkboxes represent USER methodological review, not automatic dataset validation. The FAQ chatbot is rule-based, not an LLM.

## Interactive AR explorer

The `AR · 抗藥性探索` tab adds year, organism, antibiotic, specimen, origin, facility level, and visualization selectors, deep-link sharing, CSV export and report-method notes. **Data availability:** verified national unstratified top-10 isolate counts and 2024-edition retrospective national totals only. No verified stratum-specific isolate counts, antimicrobial susceptibility heatmap, resistance rates or 95% confidence intervals are present yet. The UI deliberately displays `Data pending verification` rather than invented numbers. Selected-antibiotic values are not automatically inferred from isolate-count data. Clinical applicability is not inferred from surveillance results.

## Integrated interactive antibiogram (2026-10-21)

The homepage includes a built-in responsive antibiogram explorer with organism/year/mode filtering, cell selection, source provenance, susceptibility percent (S%), available tested-isolate denominators (n), linked 2022-2024 time-series for selected verified combinations, deep links, and CSV export. Data comes from `data/antibiogram_2024_validated.csv` (20 cells, 2024 report Figure 3-1-1, report p. 34) and `data/antibiogram_trends_2022_2024.csv` (21 report narrative observations, 2022 p.31 and 2023/2024 p.30). No absent values are imputed; 95% CIs are not generated for narrative-only reported integer percentages without n. The existing separate `antibiogram.html` remains available as a legacy view.

**Not yet completed:** exhaustive all-organism 2022-2024 heatmap extraction, hospital-level data matrices, specimen or CO/HO stratification, multi-year denominators and verified WHO numerical comparison. The completed features are limited to the above source-backed observations.

## 2026-10-21 Heatmap and interactive chart expansion

- 2024 national antibiogram dataset expanded to 145 verified transcribed S%/tested-n cells from Figure 3-1-1, printed page 34 (including the Enterobacterales panels for penicillins and cephalosporins and miscellaneous agents).
- Main dashboard now adds pointer-hover precision tooltips for main organism ranking bars, 2019–2024 retrospective totals, edition snapshots, AR charts, and integrated antibiogram cells. Touch users can click heatmap cells to see details.
- Full 2022/2023 matrices and 2024 hospital-tier matrices are **not yet fully extracted**; unavailable cells remain absent. Do not advertise three full editions as complete. Numerical figures have not undergone independent double-entry verification.

## One Health Intelligence Lab (2026-10-22)

The homepage embeds `one-health-lab.html`, which is also directly accessible as a full-screen workspace.

- AR×AU / AR×HAI / human×animal and custom X/Y research pairs
- Locally loaded CSV (`unit,year,metric_x,metric_y`) with matching unit+year and optional 0–2-year lag
- Spearman midranks or Pearson correlation, descriptive scatter/trend visualizations, paired CSV export, PNG scatter export
- A conservative minimum of eight matched pairs before showing a correlation coefficient; no p-value or causality claims
- A human/animal compatibility checklist, separate WHO/ECDC/JANIS/FAO/WOAH official resource library
- Data never leaves the browser through the analysis app; source files uploaded by visitors are not stored server-side

**Important limitations:** This is an analysis engine, not a verified cross-sector national statistical result. It does not yet provide an automated data ingestion integration, inferential panel models, epidemiologic adjustment, or verified international cross-country ranks. Users are responsible for ensuring matched units, independence assumptions and surveillance definition comparability. CSV parsing is intentionally simple and supports unquoted numeric fields and simple unit names, not complex quoted CSV with embedded commas. Results are exploratory.

Sources: https://www.who.int/initiatives/glass ; https://www.ecdc.europa.eu/en/data-dashboards-and-databases ; https://infarm.apps.fao.org/ ; https://amu.woah.org/amu-system-portal .
