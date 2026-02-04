import { useState, useMemo } from "react";

const STATES = [
  {
    name: "Alabama", abbr: "AL", saasStatus: "taxable", stateRate: 4.0, maxLocalRate: 7.5,
    classification: "Tangible personal property / specified digital products",
    nexus: "$250K in annual sales",
    notes: "SaaS generally taxable. Simplified Seller Use Tax (SSUT) program available for remote sellers at a flat 8% rate, which dramatically simplifies compliance — no need to track individual local rates if you opt in. If NOT using SSUT, local rates vary wildly and you must look up the exact combined rate for each client address.",
    lookupUrl: "https://revenue.alabama.gov/sales-use/tax-rates/",
    lookupTip: "Click 'Tax Rate Lookup' to search by address. If billing as a remote seller, consider the SSUT program (flat 8%) to avoid county-level complexity entirely.",
    localComplexity: "high"
  },
  {
    name: "Alaska", abbr: "AK", saasStatus: "no_sales_tax", stateRate: 0, maxLocalRate: 7.5,
    classification: "No state sales tax",
    nexus: "No state-level nexus (local varies)",
    notes: "No state sales tax. Some local jurisdictions (Juneau, Wasilla, Fairbanks North Star Borough, etc.) impose local sales taxes up to 7.5%. SaaS treatment at the local level varies by municipality and is often unclear. If billing a client in Alaska, verify whether the specific municipality taxes SaaS.",
    lookupUrl: "https://tax.alaska.gov/programs/programs/index.aspx?60620",
    lookupTip: "Alaska has no state sales tax, but check local rates by municipality. The Alaska Remote Seller Sales Tax Commission manages remote seller compliance for participating jurisdictions.",
    localComplexity: "medium"
  },
  {
    name: "Arizona", abbr: "AZ", saasStatus: "taxable", stateRate: 5.6, maxLocalRate: 5.6,
    classification: "Transaction Privilege Tax (TPT)",
    nexus: "$100K in annual sales",
    notes: "Taxed under Transaction Privilege Tax (TPT) as tangible personal property. Arizona's system is technically a tax on the seller's privilege of doing business, not a sales tax — but practically functions the same. Cities impose their own additional TPT. Phoenix adds ~2.3%. Combined rates can exceed 11%.",
    lookupUrl: "https://azdor.gov/transaction-privilege-tax/tpt-rate-tables",
    lookupTip: "Use the TPT Rate Tables page. Search by city or location code. Note: Arizona uses 'location codes' — each city/district has one. You can also download the full rate table as a CSV.",
    localComplexity: "high"
  },
  {
    name: "Arkansas", abbr: "AR", saasStatus: "taxable", stateRate: 6.5, maxLocalRate: 5.125,
    classification: "Specified digital products",
    nexus: "$100K or 200 transactions",
    notes: "SaaS taxable as specified digital products. Total combined rates can exceed 11.5% in some jurisdictions. County and city rates stack.",
    lookupUrl: "https://www.dfa.arkansas.gov/office/taxes/excise-tax-administration/sales-use-tax/local-tax-lookup-tools/",
    lookupTip: "Use the Arkansas DFA Local Tax Lookup Tools. Enter street address or ZIP code to find combined state, county, and city sales tax rates. Rates change quarterly in some jurisdictions.",
    localComplexity: "high"
  },
  {
    name: "California", abbr: "CA", saasStatus: "exempt", stateRate: 7.25, maxLocalRate: 3.5,
    classification: "N/A — SaaS is not tangible personal property",
    nexus: "$500K in annual sales (for tangible goods)",
    notes: "SaaS is NOT taxable in California. The state taxes only tangible personal property and specifically excludes electronically delivered software. If software is delivered on tangible media (CD, USB), it IS taxable. The rate shown applies to tangible goods only, not SaaS.",
    lookupUrl: "https://www.cdtfa.ca.gov/taxes-and-fees/sales-use-tax-rates.htm",
    lookupTip: "SaaS is exempt — no rate lookup needed for SaaS billing. Link provided only for reference if billing tangible goods.",
    localComplexity: "none"
  },
  {
    name: "Colorado", abbr: "CO", saasStatus: "exempt", stateRate: 2.9, maxLocalRate: 8.3,
    classification: "N/A — SaaS generally exempt at state level",
    nexus: "$100K in annual sales",
    notes: "SaaS generally NOT taxable at the state level. HOWEVER, Colorado has one of the most complex local tax systems in the entire country — many home-rule cities administer their own tax independently and MAY tax SaaS differently than the state. Denver, Boulder, and other home-rule cities have different rules. ALWAYS verify with the specific local jurisdiction. This is the one state where 'exempt at state level' does NOT mean 'safe to ignore.'",
    lookupUrl: "https://colorado.tax/tax-lookup",
    lookupTip: "CRITICAL: Even though SaaS is exempt at state level, use the Sales Tax Rate Lookup to check if the client's city is a 'home-rule' jurisdiction. Home-rule cities set their own rules and may tax SaaS. If in doubt, contact the specific city's tax office directly.",
    localComplexity: "high"
  },
  {
    name: "Connecticut", abbr: "CT", saasStatus: "taxable", stateRate: 6.35, maxLocalRate: 0,
    classification: "Computer and data processing services",
    nexus: "$100K and 200 transactions",
    notes: "SaaS taxable at the full 6.35% state rate as computer and data processing services. Connecticut also has a separate 1% surcharge on certain computer/data processing services — verify whether this applies to your specific SaaS type. No local sales taxes.",
    lookupUrl: "https://portal.ct.gov/DRS/Sales-Tax/Sales-and-Use-Taxes",
    lookupTip: "No local rates to look up — 6.35% applies statewide. Verify whether the 1% computer services surcharge applies to your specific service type.",
    localComplexity: "none"
  },
  {
    name: "Delaware", abbr: "DE", saasStatus: "no_sales_tax", stateRate: 0, maxLocalRate: 0,
    classification: "No sales tax",
    nexus: "N/A — no sales tax",
    notes: "No sales tax at any level. Delaware has a Gross Receipts Tax on businesses operating within the state, but that's on the seller's revenue, not charged to the buyer.",
    lookupUrl: "https://revenue.delaware.gov/",
    lookupTip: "No sales tax — nothing to look up. Delaware clients are never charged sales tax on SaaS.",
    localComplexity: "none"
  },
  {
    name: "District of Columbia", abbr: "DC", saasStatus: "taxable", stateRate: 6.0, maxLocalRate: 0,
    classification: "SaaS specifically enumerated as taxable",
    nexus: "$100K or 200 transactions",
    notes: "DC specifically includes SaaS in its tax base. Straightforward compliance — 6% flat with no local add-ons. One of the clearest SaaS taxability positions in the country.",
    lookupUrl: "https://otr.cfo.dc.gov/page/sales-and-use-tax",
    lookupTip: "No local rates — flat 6.0% on all SaaS sales to DC clients. Simplest taxable jurisdiction.",
    localComplexity: "none"
  },
  {
    name: "Florida", abbr: "FL", saasStatus: "exempt", stateRate: 6.0, maxLocalRate: 2.5,
    classification: "N/A — SaaS not tangible personal property",
    nexus: "$100K in annual sales",
    notes: "SaaS generally NOT taxable. Florida taxes tangible personal property but has not extended this to cloud-delivered SaaS. Note: Florida has a separate Communications Services Tax (CST) that could apply to some digital communication services — verify if your SaaS has voice/messaging/video components. Legislature has considered expanding digital taxation.",
    lookupUrl: "https://floridarevenue.com/taxes/taxesfees/Pages/tax_rate_table.aspx",
    lookupTip: "SaaS is exempt — no rate lookup needed for standard SaaS. If your product has communications features (VoIP, messaging), check whether the Communications Services Tax applies separately.",
    localComplexity: "none"
  },
  {
    name: "Georgia", abbr: "GA", saasStatus: "exempt", stateRate: 4.0, maxLocalRate: 5.0,
    classification: "N/A — SaaS generally not taxable",
    nexus: "$100K or 200 transactions",
    notes: "SaaS generally NOT taxable. Georgia taxes prewritten software on tangible media but cloud-delivered SaaS does not fall within its sales tax base.",
    lookupUrl: "https://dor.georgia.gov/taxes/sales-use-tax",
    lookupTip: "SaaS is exempt — no rate lookup needed for SaaS billing.",
    localComplexity: "none"
  },
  {
    name: "Hawaii", abbr: "HI", saasStatus: "taxable", stateRate: 4.0, maxLocalRate: 0.5,
    classification: "General Excise Tax (GET)",
    nexus: "$100K or 200 transactions",
    notes: "Hawaii's General Excise Tax (GET) applies to virtually ALL business activities, including SaaS. The GET is technically on the seller, not the buyer — but it's standard practice to pass it through. When passed through, the effective rate is 4.166% (state) or 4.712% (with Oahu surcharge) because the tax on the pass-through is itself taxable.",
    lookupUrl: "https://tax.hawaii.gov/geninfo/get/",
    lookupTip: "Only two rates to know: 4.0% statewide (effective 4.166% when passed through) or 4.5% on Oahu (effective 4.712% passed through). Ask the client: are you on Oahu? That's it.",
    localComplexity: "low"
  },
  {
    name: "Idaho", abbr: "ID", saasStatus: "taxable", stateRate: 6.0, maxLocalRate: 3.0,
    classification: "Specified digital products / prewritten software",
    nexus: "$100K in annual sales",
    notes: "Idaho taxes specified digital products including remotely accessed software. Some resort-area local taxes apply on top of the state rate.",
    lookupUrl: "https://tax.idaho.gov/i-1179.cfm",
    lookupTip: "Use the Tax Rate Lookup tool. Most Idaho areas are just the 6% state rate. Resort cities (Sun Valley, McCall, etc.) may add up to 3% — these are the main ones to watch.",
    localComplexity: "low"
  },
  {
    name: "Illinois", abbr: "IL", saasStatus: "exempt", stateRate: 6.25, maxLocalRate: 5.25,
    classification: "N/A — SaaS not taxable if no possession transferred",
    nexus: "$100K or 200 transactions",
    notes: "SaaS generally NOT taxable at the state level IF the customer does not take possession of the software (true cloud). CRITICAL EXCEPTION: Chicago imposes its own Personal Property Lease Transaction Tax and Amusement Tax on some cloud-based services. If billing Chicago-based clients, research these separately.",
    lookupUrl: "https://tax.illinois.gov/research/taxrates/st.html",
    lookupTip: "SaaS is exempt at state level. HOWEVER — if billing a Chicago client, check the Chicago Amusement Tax and Personal Property Lease Transaction Tax. These are city-level taxes that may apply to cloud services independently of state exemption. Contact the Chicago Department of Finance for clarification.",
    localComplexity: "low"
  },
  {
    name: "Indiana", abbr: "IN", saasStatus: "taxable", stateRate: 7.0, maxLocalRate: 0,
    classification: "Specified digital products",
    nexus: "$100K or 200 transactions",
    notes: "SaaS taxable as a specified digital product at the full 7% state rate. Indiana has NO local option sales taxes, so the rate is the same statewide. One of the simplest taxable states to manage.",
    lookupUrl: "https://www.in.gov/dor/business-tax/sales-tax/",
    lookupTip: "No local rates — flat 7.0% statewide on all SaaS. No lookup needed.",
    localComplexity: "none"
  },
  {
    name: "Iowa", abbr: "IA", saasStatus: "taxable", stateRate: 6.0, maxLocalRate: 1.0,
    classification: "Specified digital products (since January 2019)",
    nexus: "$100K in annual sales",
    notes: "SaaS taxable as a specified digital product since January 1, 2019. Local option taxes up to 1% apply in many jurisdictions.",
    lookupUrl: "https://tax.iowa.gov/local-option-sales-tax-lot",
    lookupTip: "Use the Local Option Sales Tax (LOST) lookup to check if the client's jurisdiction adds 1%. Most Iowa cities impose the 1% local option — assume 7% total unless you confirm otherwise.",
    localComplexity: "low"
  },
  {
    name: "Kansas", abbr: "KS", saasStatus: "taxable", stateRate: 6.5, maxLocalRate: 4.0,
    classification: "Tangible personal property / prewritten software",
    nexus: "$100K in annual sales",
    notes: "SaaS generally taxable as prewritten computer software. Combined state and local rates can exceed 10.5%. Kansas has numerous special taxing districts that add complexity.",
    lookupUrl: "https://www.ksrevenue.gov/tasalesanduse.html",
    lookupTip: "Use the Kansas Tax Rate Lookup on the Revenue site. Enter the client's address to get the exact combined rate. Kansas also publishes a downloadable jurisdiction/rate table (Publication KS-1700) — useful if billing many Kansas clients.",
    localComplexity: "high"
  },
  {
    name: "Kentucky", abbr: "KY", saasStatus: "taxable", stateRate: 6.0, maxLocalRate: 0,
    classification: "Specified digital products (since January 2023)",
    nexus: "$100K or 200 transactions",
    notes: "SaaS became taxable on January 1, 2023 as part of Kentucky's expansion to specified digital products. No local sales taxes — 6% flat statewide. Relatively new rule.",
    lookupUrl: "https://revenue.ky.gov/Business/Sales-Use-Tax/",
    lookupTip: "No local rates — flat 6.0% statewide. No lookup needed.",
    localComplexity: "none"
  },
  {
    name: "Louisiana", abbr: "LA", saasStatus: "taxable", stateRate: 4.45, maxLocalRate: 7.0,
    classification: "Taxable service / digital products",
    nexus: "$100K or 200 transactions",
    notes: "SaaS generally taxable. Louisiana has some of the HIGHEST combined rates in the country — total can exceed 11.45%. CRITICAL: Local tax administration is handled by separate parish-level agencies, not the state. You may need to register with and file returns to individual parishes. Widely considered one of the most complex compliance states in the country.",
    lookupUrl: "https://revenue.louisiana.gov/SalesTax/SalesTaxRate",
    lookupTip: "Use the Louisiana Sales Tax Rate Lookup — enter the client's address to get the exact combined rate. IMPORTANT: Even after you find the rate, note that LOCAL returns must be filed separately with each parish collector. The Louisiana Uniform Local Sales Tax Board (LUSTB) is working to simplify this, but it's still messy. Consider the SSUT program if available.",
    localComplexity: "high"
  },
  {
    name: "Maine", abbr: "ME", saasStatus: "exempt", stateRate: 5.5, maxLocalRate: 0,
    classification: "N/A — SaaS not tangible personal property",
    nexus: "$100K or 200 transactions",
    notes: "SaaS generally NOT taxable. Maine taxes prewritten software on tangible media but has not extended sales tax to cloud-delivered SaaS. No local sales taxes.",
    lookupUrl: "https://www.maine.gov/revenue/taxes/sales-use-tax",
    lookupTip: "SaaS is exempt — no rate lookup needed.",
    localComplexity: "none"
  },
  {
    name: "Maryland", abbr: "MD", saasStatus: "taxable", stateRate: 6.0, maxLocalRate: 0,
    classification: "Digital code / SaaS (expanded since 2021)",
    nexus: "$100K or 200 transactions",
    notes: "Maryland expanded its sales tax to cover digital goods and SaaS starting in 2021. SaaS taxable as a 'digital code.' No local sales taxes. Maryland also has a separate Digital Advertising Gross Revenue Tax aimed at large platforms.",
    lookupUrl: "https://www.marylandtaxes.gov/business/sales-use/",
    lookupTip: "No local rates — flat 6.0% statewide. No lookup needed.",
    localComplexity: "none"
  },
  {
    name: "Massachusetts", abbr: "MA", saasStatus: "taxable", stateRate: 6.25, maxLocalRate: 0,
    classification: "Prewritten software / SaaS specifically enumerated",
    nexus: "$100K in annual sales",
    notes: "SaaS is specifically and clearly taxable in Massachusetts. No local option sales taxes — 6.25% flat statewide. One of the clearest, most straightforward taxable states.",
    lookupUrl: "https://www.mass.gov/sales-and-use-tax",
    lookupTip: "No local rates — flat 6.25% statewide. No lookup needed.",
    localComplexity: "none"
  },
  {
    name: "Michigan", abbr: "MI", saasStatus: "exempt", stateRate: 6.0, maxLocalRate: 0,
    classification: "N/A — electronically delivered software exempt",
    nexus: "$100K or 200 transactions",
    notes: "SaaS NOT taxable. Michigan specifically exempts electronically delivered software from sales tax. No local sales taxes anywhere in the state.",
    lookupUrl: "https://www.michigan.gov/taxes/business-taxes/sales-use-tax",
    lookupTip: "SaaS is exempt — no rate lookup needed.",
    localComplexity: "none"
  },
  {
    name: "Minnesota", abbr: "MN", saasStatus: "exempt", stateRate: 6.875, maxLocalRate: 2.0,
    classification: "N/A — SaaS exempt",
    nexus: "$100K or 200 transactions",
    notes: "SaaS generally NOT taxable. Minnesota has specific exemptions for electronically delivered software and SaaS.",
    lookupUrl: "https://www.revenue.state.mn.us/sales-tax-rate-finder",
    lookupTip: "SaaS is exempt — no rate lookup needed for SaaS billing.",
    localComplexity: "none"
  },
  {
    name: "Mississippi", abbr: "MS", saasStatus: "taxable", stateRate: 7.0, maxLocalRate: 0.25,
    classification: "Computer software / specified digital products",
    nexus: "$250K in annual sales",
    notes: "SaaS taxable at the full 7% state rate — one of the highest state rates in the country. Very limited local additions (only tourism-related in a few areas). Higher nexus threshold ($250K).",
    lookupUrl: "https://www.dor.ms.gov/sales-use-tax",
    lookupTip: "Almost always just the flat 7.0% state rate. The only local additions are small tourism taxes in a few resort areas. For most clients, just charge 7%.",
    localComplexity: "low"
  },
  {
    name: "Missouri", abbr: "MO", saasStatus: "exempt", stateRate: 4.225, maxLocalRate: 5.875,
    classification: "N/A — SaaS not tangible personal property",
    nexus: "$100K in annual sales",
    notes: "SaaS generally NOT taxable. Missouri has not extended its sales tax to SaaS. Watch for legislative changes.",
    lookupUrl: "https://dor.mo.gov/taxation/business/tax-types/sales-use/rate-tables/",
    lookupTip: "SaaS is exempt — no rate lookup needed.",
    localComplexity: "none"
  },
  {
    name: "Montana", abbr: "MT", saasStatus: "no_sales_tax", stateRate: 0, maxLocalRate: 0,
    classification: "No sales tax",
    nexus: "N/A — no sales tax",
    notes: "No general sales tax at any level. Some resort communities have small local resort taxes, but these are narrowly targeted and unlikely to apply to SaaS.",
    lookupUrl: "https://mtrevenue.gov/",
    lookupTip: "No sales tax — nothing to look up.",
    localComplexity: "none"
  },
  {
    name: "Nebraska", abbr: "NE", saasStatus: "taxable", stateRate: 5.5, maxLocalRate: 2.5,
    classification: "Prewritten computer software / specified digital products",
    nexus: "$100K or 200 transactions",
    notes: "SaaS taxable as prewritten computer software regardless of delivery method. Local rates apply in many cities and counties. Combined rates can approach 8%.",
    lookupUrl: "https://revenue.nebraska.gov/businesses/sales-and-use-tax/sales-and-use-tax-rates",
    lookupTip: "Use the rate lookup to find the combined rate by city or county. Nebraska publishes a complete rate table (Form 6) you can download. Most cities add 1-2% on top of the 5.5% state rate.",
    localComplexity: "medium"
  },
  {
    name: "Nevada", abbr: "NV", saasStatus: "exempt", stateRate: 6.85, maxLocalRate: 1.525,
    classification: "N/A — SaaS not tangible personal property",
    nexus: "$100K or 200 transactions",
    notes: "SaaS generally NOT taxable. Nevada taxes tangible personal property but has not extended this to SaaS. No income tax state — watch for possible sales tax expansion.",
    lookupUrl: "https://tax.nv.gov/FAQs/Sales_Tax_Information/",
    lookupTip: "SaaS is exempt — no rate lookup needed.",
    localComplexity: "none"
  },
  {
    name: "New Hampshire", abbr: "NH", saasStatus: "no_sales_tax", stateRate: 0, maxLocalRate: 0,
    classification: "No sales tax",
    nexus: "N/A — no sales tax",
    notes: "No general sales tax. New Hampshire has a 7% Communications Services Tax (CST) that could apply to SaaS with voice, messaging, or video communication features.",
    lookupUrl: "https://www.revenue.nh.gov/",
    lookupTip: "No sales tax. If your SaaS includes communication features (VoIP, video, messaging), check whether the 7% Communications Services Tax applies.",
    localComplexity: "none"
  },
  {
    name: "New Jersey", abbr: "NJ", saasStatus: "taxable", stateRate: 6.625, maxLocalRate: 0,
    classification: "Prewritten computer software (regardless of delivery)",
    nexus: "$100K or 200 transactions",
    notes: "SaaS taxable as prewritten software regardless of delivery method. No local option taxes — flat 6.625% statewide. Urban Enterprise Zones (UEZ) may have reduced rates. Salem County has a reduced 3.3125% rate.",
    lookupUrl: "https://www.state.nj.us/treasury/taxation/su_over.shtml",
    lookupTip: "Almost always flat 6.625% statewide. Only exceptions: Salem County (3.3125%) and Urban Enterprise Zones. If the client isn't in Salem County or a UEZ, just charge 6.625%.",
    localComplexity: "low"
  },
  {
    name: "New Mexico", abbr: "NM", saasStatus: "taxable", stateRate: 5.0, maxLocalRate: 4.3125,
    classification: "Gross Receipts Tax (GRT) — nearly all services taxable",
    nexus: "$100K in annual sales",
    notes: "New Mexico's Gross Receipts Tax applies to virtually ALL services, including SaaS. Like Hawaii's GET, the GRT is technically on the seller but commonly passed through. Combined rates can exceed 9%. Now destination-based, adding complexity.",
    lookupUrl: "https://tax.newmexico.gov/tax-tables/",
    lookupTip: "Use the NM Tax Rate Lookup — it's destination-based, so you need the client's specific address. Download the rate schedule (FYI-105) or use the online lookup. Combined rates vary dramatically by location — Albuquerque, Santa Fe, and Las Cruces all have different local rates.",
    localComplexity: "high"
  },
  {
    name: "New York", abbr: "NY", saasStatus: "taxable", stateRate: 4.0, maxLocalRate: 4.875,
    classification: "Prewritten computer software",
    nexus: "$500K and 100 transactions",
    notes: "SaaS taxable as prewritten software. NYC adds 4.5% for a combined 8.875%. MCTD surcharge may add further. Higher nexus threshold ($500K AND 100+ transactions). Custom software is generally exempt — the canned vs. custom distinction matters.",
    lookupUrl: "https://www.tax.ny.gov/bus/st/strate.htm",
    lookupTip: "Use the NY Tax Rate Lookup by jurisdiction. Key rates to know: NYC = 8.875%, most suburban counties = 8-8.375%. The page lets you search by address or jurisdiction code. Download Publication 718 for the complete rate table.",
    localComplexity: "high"
  },
  {
    name: "North Carolina", abbr: "NC", saasStatus: "exempt", stateRate: 4.75, maxLocalRate: 2.75,
    classification: "N/A — SaaS generally not included in 'digital property'",
    nexus: "$100K or 200 transactions",
    notes: "SaaS generally NOT taxable under current interpretation. North Carolina taxes 'digital property' but has not included SaaS. Under active review by the NC Department of Revenue — monitor for changes.",
    lookupUrl: "https://www.ncdor.gov/taxes-forms/sales-and-use-tax",
    lookupTip: "SaaS currently exempt — no rate lookup needed. However, this is under active review. Check the NC DOR site periodically for updates.",
    localComplexity: "none"
  },
  {
    name: "North Dakota", abbr: "ND", saasStatus: "exempt", stateRate: 5.0, maxLocalRate: 3.5,
    classification: "N/A — SaaS generally not tangible personal property",
    nexus: "$100K in annual sales",
    notes: "SaaS generally NOT taxable. North Dakota taxes prewritten software on tangible media but has not extended sales tax to cloud-delivered SaaS.",
    lookupUrl: "https://www.tax.nd.gov/business/sales-and-use-tax",
    lookupTip: "SaaS is exempt — no rate lookup needed.",
    localComplexity: "none"
  },
  {
    name: "Ohio", abbr: "OH", saasStatus: "taxable", stateRate: 5.75, maxLocalRate: 2.25,
    classification: "Automatic data processing and computer services",
    nexus: "$100K or 200 transactions",
    notes: "SaaS taxable as automatic data processing and computer services. County transit authorities add their own rates. Combined rates commonly 7-8%. Ohio has a broad definition of taxable computer services.",
    lookupUrl: "https://tax.ohio.gov/sales-and-use/rate-changes",
    lookupTip: "Use the Ohio Tax Rate Finder — search by address or county. Most counties add 1.5-2.25% on top of the 5.75% state rate. The combined rate is usually 7.25-8.0%. Rate changes happen twice a year (Jan 1 and July 1) — check before each billing cycle.",
    localComplexity: "medium"
  },
  {
    name: "Oklahoma", abbr: "OK", saasStatus: "exempt", stateRate: 4.5, maxLocalRate: 7.0,
    classification: "N/A — SaaS generally not tangible personal property",
    nexus: "$100K in annual sales",
    notes: "SaaS generally NOT taxable. Oklahoma has not extended sales tax to cloud-delivered software. Note: Oklahoma has some of the highest LOCAL tax rates in the country for tangible goods (combined 11%+), but these don't apply to exempt SaaS.",
    lookupUrl: "https://oklahoma.gov/tax/businesses/sales-use/rate-locator.html",
    lookupTip: "SaaS is exempt — no rate lookup needed.",
    localComplexity: "none"
  },
  {
    name: "Oregon", abbr: "OR", saasStatus: "no_sales_tax", stateRate: 0, maxLocalRate: 0,
    classification: "No sales tax",
    nexus: "N/A — no sales tax",
    notes: "No general sales tax at any level. Oregon has a Corporate Activity Tax (CAT) on businesses with $1M+ in Oregon commercial activity, but this is not a sales tax charged to buyers.",
    lookupUrl: "https://www.oregon.gov/dor/",
    lookupTip: "No sales tax — nothing to look up.",
    localComplexity: "none"
  },
  {
    name: "Pennsylvania", abbr: "PA", saasStatus: "taxable", stateRate: 6.0, maxLocalRate: 2.0,
    classification: "Canned / prewritten computer software",
    nexus: "$100K in annual sales",
    notes: "SaaS taxable as canned (prewritten) software. Philadelphia adds 2% (total 8%). Allegheny County (Pittsburgh) adds 1% (total 7%). All other areas are 6% state rate only. Custom software is generally exempt.",
    lookupUrl: "https://www.revenue.pa.gov/TaxTypes/SUT/Pages/default.aspx",
    lookupTip: "Simple 3-tier system: Philadelphia = 8.0%, Allegheny County (Pittsburgh) = 7.0%, everywhere else in PA = 6.0%. Just ask: Is the client in Philly? Pittsburgh/Allegheny County? If neither, it's 6%.",
    localComplexity: "low"
  },
  {
    name: "Rhode Island", abbr: "RI", saasStatus: "taxable", stateRate: 7.0, maxLocalRate: 0,
    classification: "Prewritten computer software / SaaS",
    nexus: "$100K or 200 transactions",
    notes: "SaaS taxable at the full 7% state rate — tied for the highest state sales tax rate in the country. No local option taxes.",
    lookupUrl: "https://tax.ri.gov/tax-sections/sales-use-tax",
    lookupTip: "No local rates — flat 7.0% statewide. No lookup needed.",
    localComplexity: "none"
  },
  {
    name: "South Carolina", abbr: "SC", saasStatus: "taxable", stateRate: 6.0, maxLocalRate: 3.0,
    classification: "Prewritten software / communications",
    nexus: "$100K in annual sales",
    notes: "SaaS generally taxable. Various local and special district taxes apply. Maximum combined rate around 9%. SC has a $300 per-item sales tax cap on certain items.",
    lookupUrl: "https://dor.sc.gov/tax/sales-and-use",
    lookupTip: "Use the SC DOR rate lookup by county. Most counties add 1-2% on top of the 6% state rate. Some counties have special capital project or school taxes that add another 1%. Verify the specific county's combined rate.",
    localComplexity: "medium"
  },
  {
    name: "South Dakota", abbr: "SD", saasStatus: "taxable", stateRate: 4.2, maxLocalRate: 4.5,
    classification: "Electronic products / tangible personal property",
    nexus: "$100K or 200 transactions",
    notes: "SaaS taxable. Historically significant as the Wayfair v. South Dakota state that established economic nexus nationally. Municipal taxes can add significantly.",
    lookupUrl: "https://dor.sd.gov/businesses/taxes/sales-use-tax/tax-rate-chart/",
    lookupTip: "Use the SD tax rate chart to find the combined rate by municipality. Sioux Falls has one of the higher local rates. Base rates are moderate but local additions matter — always check.",
    localComplexity: "medium"
  },
  {
    name: "Tennessee", abbr: "TN", saasStatus: "taxable", stateRate: 7.0, maxLocalRate: 2.75,
    classification: "Specified digital products / computer software",
    nexus: "$100K in annual sales",
    notes: "SaaS taxable. Tennessee has one of the HIGHEST combined rates in the nation — the 7% state rate plus local taxes commonly produces 9.25–9.75%. No state income tax, so sales tax is a primary revenue source.",
    lookupUrl: "https://tntaxrate.tntaxlookup.tax.tn.gov/tax.aspx",
    lookupTip: "Use the Tennessee Tax Rate Lookup — enter the client's address and it returns the EXACT combined rate. This is one of the best state lookup tools in the country. Bookmark this one. Most areas come in at 9.25-9.75% combined.",
    localComplexity: "medium"
  },
  {
    name: "Texas", abbr: "TX", saasStatus: "taxable", stateRate: 6.25, maxLocalRate: 2.0,
    classification: "Data processing service (taxed at 80% of value)",
    nexus: "$500K in annual sales",
    notes: "SaaS taxed as 'data processing service' at 80% of value — the effective state rate is ~5% (80% × 6.25%). Local jurisdictions add up to 2% for a max combined rate of 8.25%. Higher nexus threshold ($500K). The 20% exemption is significant savings.",
    lookupUrl: "https://mycpa.cpa.state.tx.us/atj/atj.html",
    lookupTip: "Use the Texas Comptroller's Address-Based Tax Rate Lookup — this is the gold standard. Enter the client's exact address and it returns the precise combined rate. Remember: SaaS is taxed at 80% of value as a 'data processing service,' so multiply the combined rate by 0.8 to get the effective rate. Example: 8.25% combined × 0.8 = 6.6% effective.",
    localComplexity: "medium"
  },
  {
    name: "Utah", abbr: "UT", saasStatus: "taxable", stateRate: 6.1, maxLocalRate: 3.35,
    classification: "Prewritten software / specified digital products",
    nexus: "$100K or 200 transactions",
    notes: "SaaS taxable as prewritten computer software. Combined rates can approach 9.5%. Utah's 6.1% state rate is actually a combination of multiple components (state base, county option, local, transit).",
    lookupUrl: "https://tax.utah.gov/sales/rates",
    lookupTip: "Use the Utah Tax Rate Lookup by address or zip code. The base 'state' rate of 6.1% already includes several mandatory components. Local additions bring total to 7.25-9.05% depending on location. Salt Lake City area is typically ~7.75%.",
    localComplexity: "medium"
  },
  {
    name: "Vermont", abbr: "VT", saasStatus: "taxable", stateRate: 6.0, maxLocalRate: 1.0,
    classification: "Prewritten software / specified digital products",
    nexus: "$100K or 200 transactions",
    notes: "SaaS generally taxable. Limited local option tax in some municipalities. Combined rates top out around 7%.",
    lookupUrl: "https://tax.vermont.gov/business-and-corp/sales-and-use-tax",
    lookupTip: "Most areas are just the 6% state rate. A few municipalities add up to 1% local option tax. Check the VT tax department for which municipalities have the local option enabled. Low complexity overall.",
    localComplexity: "low"
  },
  {
    name: "Virginia", abbr: "VA", saasStatus: "exempt", stateRate: 5.3, maxLocalRate: 1.7,
    classification: "N/A — SaaS specifically exempt",
    nexus: "$100K or 200 transactions",
    notes: "SaaS is NOT taxable — Virginia specifically exempts SaaS. The rate structure (4.3% state + 1% mandatory local = 5.3% base, higher in some regions) applies to tangible goods, not SaaS.",
    lookupUrl: "https://www.tax.virginia.gov/sales-and-use-tax",
    lookupTip: "SaaS is exempt — no rate lookup needed.",
    localComplexity: "none"
  },
  {
    name: "Washington", abbr: "WA", saasStatus: "taxable", stateRate: 6.5, maxLocalRate: 4.0,
    classification: "Digital automated services",
    nexus: "$100K in annual sales",
    notes: "SaaS specifically taxable as 'digital automated service.' Combined rates commonly 8.5–10.5%, with Seattle metro approaching 10.25%. No state income tax — sales tax rates are high. Washington also imposes B&O tax on the seller's gross revenue (separate from sales tax, not passed to buyer).",
    lookupUrl: "https://dor.wa.gov/tax-rate-lookup",
    lookupTip: "Use the Washington Tax Rate Lookup — enter the client's address for the exact combined rate. This is a well-built tool. Seattle area is ~10.25%. Rates vary significantly across the state. ALSO: Be aware that Washington's B&O tax (on your revenue as the seller) is a separate obligation — it reduces your margin on WA sales but is NOT charged to the client.",
    localComplexity: "high"
  },
  {
    name: "West Virginia", abbr: "WV", saasStatus: "taxable", stateRate: 6.0, maxLocalRate: 1.0,
    classification: "Prewritten software / specified digital products",
    nexus: "$100K or 200 transactions",
    notes: "SaaS taxable. Limited local additions. Most areas are just the 6% state rate. Some municipalities impose a B&O tax that may apply to SaaS revenue.",
    lookupUrl: "https://tax.wv.gov/Business/SalesAndUseTax/Pages/SalesAndUseTax.aspx",
    lookupTip: "Most areas are just the flat 6% state rate. A few municipalities add up to 1% — verify if the client is in one of those. Low complexity overall.",
    localComplexity: "low"
  },
  {
    name: "Wisconsin", abbr: "WI", saasStatus: "taxable", stateRate: 5.0, maxLocalRate: 1.75,
    classification: "Prewritten computer software",
    nexus: "$100K in annual sales",
    notes: "SaaS taxable as prewritten software. County taxes of 0.5% apply in most counties. Some special districts (Milwaukee stadium, Brown County football stadium) add more. Combined rates typically 5.5–5.6%.",
    lookupUrl: "https://www.revenue.wi.gov/Pages/FAQS/pcs-sales.aspx",
    lookupTip: "Most of Wisconsin is 5.5% (5% state + 0.5% county). Milwaukee County is 5.6%. Brown County (Green Bay) and a few others are slightly higher. Check the WI DOR rate table for specific counties, but 5.5% is a safe assumption for most.",
    localComplexity: "low"
  },
  {
    name: "Wyoming", abbr: "WY", saasStatus: "taxable", stateRate: 4.0, maxLocalRate: 2.0,
    classification: "Specified digital products",
    nexus: "$100K or 200 transactions",
    notes: "SaaS taxable as specified digital products. Relatively low combined rates (max 6%). No state income tax. Small population — fewer jurisdictions to manage.",
    lookupUrl: "https://revenue.wyo.gov/tax-types/sales-use-tax",
    lookupTip: "Use the Wyoming tax rate lookup by location. Combined rates are low (4-6%). Small number of jurisdictions makes this straightforward.",
    localComplexity: "low"
  },
];

const STATUS_CONFIG = {
  taxable: { label: "SaaS Taxable", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700 border border-red-200", dot: "bg-red-500", ring: "ring-red-200" },
  exempt: { label: "SaaS Exempt", bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500", ring: "ring-emerald-200" },
  no_sales_tax: { label: "No Sales Tax", bg: "bg-sky-50", border: "border-sky-200", badge: "bg-sky-100 text-sky-700 border border-sky-200", dot: "bg-sky-500", ring: "ring-sky-200" },
};

const COMPLEXITY_CONFIG = {
  none: { label: "No local lookup needed", color: "text-emerald-600", bg: "bg-emerald-50", icon: "✓" },
  low: { label: "Low complexity — few local variations", color: "text-blue-600", bg: "bg-blue-50", icon: "○" },
  medium: { label: "Medium — verify local rate per address", color: "text-amber-600", bg: "bg-amber-50", icon: "△" },
  high: { label: "High — complex local system, always verify", color: "text-red-600", bg: "bg-red-50", icon: "⚠" },
};

export default function SaaSTaxNavigator() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [calcState, setCalcState] = useState("");
  const [calcAmount, setCalcAmount] = useState("");
  const [localRate, setLocalRate] = useState("");
  const [tab, setTab] = useState("lookup");

  const sorted = useMemo(() => [...STATES].sort((a, b) => a.name.localeCompare(b.name)), []);

  const filtered = useMemo(() => {
    return sorted.filter(s => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.abbr.toLowerCase() === q;
      const matchFilter = filter === "all" || s.saasStatus === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter, sorted]);

  const counts = useMemo(() => ({
    all: STATES.length,
    taxable: STATES.filter(s => s.saasStatus === "taxable").length,
    exempt: STATES.filter(s => s.saasStatus === "exempt").length,
    no_sales_tax: STATES.filter(s => s.saasStatus === "no_sales_tax").length,
  }), []);

  const selectedCalcState = useMemo(() => STATES.find(s => s.abbr === calcState), [calcState]);

  const calcResult = useMemo(() => {
    if (!selectedCalcState || !calcAmount) return null;
    const amt = parseFloat(calcAmount);
    if (isNaN(amt) || amt <= 0) return null;
    const local = parseFloat(localRate) || 0;
    if (selectedCalcState.saasStatus === "no_sales_tax") return { state: selectedCalcState, amount: amt, tax: 0, total: amt, isTaxable: false, reason: "no_sales_tax" };
    if (selectedCalcState.saasStatus === "exempt") return { state: selectedCalcState, amount: amt, tax: 0, total: amt, isTaxable: false, reason: "exempt" };
    let effectiveStateRate = selectedCalcState.stateRate;
    let texasNote = false;
    if (selectedCalcState.abbr === "TX") {
      effectiveStateRate = selectedCalcState.stateRate * 0.8;
      texasNote = true;
    }
    const effectiveLocalRate = selectedCalcState.abbr === "TX" ? local * 0.8 : local;
    const totalRate = effectiveStateRate + effectiveLocalRate;
    const displayTotalRate = selectedCalcState.stateRate + local;
    const tax = amt * (totalRate / 100);
    return { state: selectedCalcState, amount: amt, stateRate: selectedCalcState.stateRate, effectiveStateRate, localRate: local, effectiveLocalRate, totalRate, displayTotalRate, tax, total: amt + tax, isTaxable: true, texasNote };
  }, [selectedCalcState, calcAmount, localRate]);

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SaaS Sales Tax Navigator</h1>
              <p className="text-sm text-slate-500 mt-1">50 states + DC — SaaS taxability, rates, lookup tools, and compliance reference</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400">Nexys LLC</span>
              <span className="text-xs text-slate-400">Reference: Early 2025</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-slate-100 p-1 rounded-lg w-fit">
            {[
              { key: "lookup", label: "State Lookup" },
              { key: "calculator", label: "Tax Calculator" },
              { key: "summary", label: "Quick Summary" },
              { key: "workflow", label: "Lori's Workflow" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">

        {/* === WORKFLOW TAB === */}
        {tab === "workflow" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">How to Use This Tool</h2>
              <p className="text-sm text-slate-600 mb-5">Follow these steps every time you need to calculate SaaS sales tax for a client.</p>

              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Find the client's state",
                    detail: "Go to the State Lookup tab and search for the client's state. Check if SaaS is taxable, exempt, or if the state has no sales tax.",
                    color: "blue"
                  },
                  {
                    step: "2",
                    title: "If SaaS is exempt or no sales tax → you're done",
                    detail: "No tax to collect. Bill the client the full amount with no sales tax line item. Note: Watch Colorado — SaaS is exempt at the state level but some home-rule cities may still tax it.",
                    color: "emerald"
                  },
                  {
                    step: "3",
                    title: "If SaaS is taxable → check if local rates apply",
                    detail: "Look at the 'Local Rate Complexity' indicator. If it says 'No local lookup needed,' you already have the rate. If local rates vary, proceed to step 4.",
                    color: "amber"
                  },
                  {
                    step: "4",
                    title: "Look up the exact local rate",
                    detail: "Click the 'Look Up Exact Rate →' link in the state detail. It takes you directly to that state's rate finder tool. Enter the client's address to get the precise combined rate.",
                    color: "amber"
                  },
                  {
                    step: "5",
                    title: "Calculate the tax",
                    detail: "Go to the Tax Calculator tab. Select the state, enter the sale amount, enter the local rate you found, and the tool calculates the tax. For Texas, the 80% data processing rule is applied automatically.",
                    color: "blue"
                  },
                  {
                    step: "6",
                    title: "Verify periodically",
                    detail: "Local rates change — typically quarterly. Re-check the rate at least once per quarter for recurring billing clients. Bookmark the rate lookup pages for your most common states.",
                    color: "slate"
                  },
                ].map(item => (
                  <div key={item.step} className={`flex gap-4 items-start`}>
                    <div className={`w-8 h-8 rounded-full bg-${item.color}-100 text-${item.color}-700 flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Decision Tree</h2>
              <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-700 space-y-1 leading-relaxed">
                <p>Client's state → <strong>No sales tax?</strong> (AK, DE, MT, NH, OR)</p>
                <p className="pl-6">→ No tax to collect. Done.</p>
                <p className="mt-2">Client's state → <strong>SaaS exempt?</strong></p>
                <p className="pl-6">→ No tax to collect. Done.</p>
                <p className="pl-6 text-amber-700">→ Exception: Check Colorado home-rule cities & Chicago</p>
                <p className="mt-2">Client's state → <strong>SaaS taxable?</strong></p>
                <p className="pl-6">→ <strong>No local tax?</strong> (CT, DC, IN, KY, MA, MD, NJ, RI)</p>
                <p className="pl-12">→ Use state rate. Done.</p>
                <p className="pl-6">→ <strong>Has local tax?</strong></p>
                <p className="pl-12">→ Look up combined rate using state's rate finder tool</p>
                <p className="pl-12">→ Enter in calculator. Done.</p>
                <p className="mt-2 text-blue-700">Special: Texas → multiply rate × 0.8 (data processing rule)</p>
                <p className="text-blue-700">Special: Hawaii → pass-through rate is 4.166%, not 4.0%</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">When to Consider Avalara / TaxJar</h3>
              <p className="text-sm text-amber-700 leading-relaxed">If Nexys is billing 50+ clients across 15+ states with monthly recurring charges, the manual lookup process above works but gets time-consuming. Tax automation services ($50-500/mo) handle rate lookups, return filing, and nexus monitoring automatically. The break-even point is usually around the time you're spending 5+ hours per month on tax compliance.</p>
            </div>
          </div>
        )}

        {/* === CALCULATOR TAB === */}
        {tab === "calculator" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Calculate SaaS Sales Tax</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Client's State</label>
                  <select value={calcState} onChange={e => { setCalcState(e.target.value); setLocalRate(""); }} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="">Select state...</option>
                    {sorted.map(s => (
                      <option key={s.abbr} value={s.abbr}>{s.name} ({s.abbr}) {s.saasStatus === "exempt" ? "— Exempt" : s.saasStatus === "no_sales_tax" ? "— No Tax" : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Sale Amount ($)</label>
                  <input type="number" value={calcAmount} onChange={e => setCalcAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>

              {/* Show local rate input and lookup link for taxable states with local rates */}
              {selectedCalcState && selectedCalcState.saasStatus === "taxable" && selectedCalcState.maxLocalRate > 0 && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Local Tax Rate %</label>
                      <input type="number" value={localRate} onChange={e => setLocalRate(e.target.value)} placeholder="0.00" min="0" max={selectedCalcState.maxLocalRate} step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white" />
                      <p className="text-xs text-slate-500 mt-1">Local rates in {selectedCalcState.name} range from 0% to {selectedCalcState.maxLocalRate}%</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500 mb-1.5">Don't know the local rate?</p>
                      <a href={selectedCalcState.lookupUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        Look Up {selectedCalcState.name} Rate →
                      </a>
                      <p className="text-xs text-blue-600 mt-1.5">{selectedCalcState.lookupTip}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Flat rate states - no local lookup needed */}
              {selectedCalcState && selectedCalcState.saasStatus === "taxable" && selectedCalcState.maxLocalRate === 0 && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-700">✓ <strong>{selectedCalcState.name}</strong> has no local sales tax — flat {selectedCalcState.stateRate}% statewide. No rate lookup needed.</p>
                </div>
              )}

              {/* Exempt state message */}
              {selectedCalcState && selectedCalcState.saasStatus === "exempt" && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-700">✓ <strong>SaaS is exempt in {selectedCalcState.name}.</strong> No sales tax to collect.</p>
                  {selectedCalcState.abbr === "CO" && (
                    <p className="text-xs text-amber-700 mt-1">⚠ Exception: Colorado home-rule cities may tax SaaS independently. Verify with the client's specific city.</p>
                  )}
                  {selectedCalcState.abbr === "IL" && (
                    <p className="text-xs text-amber-700 mt-1">⚠ Exception: Chicago may apply its Amusement Tax or Personal Property Lease Transaction Tax to some cloud services.</p>
                  )}
                </div>
              )}

              {/* No sales tax message */}
              {selectedCalcState && selectedCalcState.saasStatus === "no_sales_tax" && (
                <div className="mt-4 bg-sky-50 border border-sky-200 rounded-lg p-3">
                  <p className="text-sm text-sky-700">✓ <strong>{selectedCalcState.name} has no general sales tax.</strong> No sales tax to collect.</p>
                  {selectedCalcState.abbr === "AK" && (
                    <p className="text-xs text-amber-700 mt-1">⚠ Note: Some Alaska municipalities impose local sales taxes independently. If the client is in Juneau, Wasilla, or similar, verify locally.</p>
                  )}
                </div>
              )}

              {/* Calculation Result */}
              {calcResult && calcResult.isTaxable && (
                <div className="mt-4 bg-white border-2 border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Sale Amount</p>
                      <p className="text-lg font-semibold text-slate-900">${calcResult.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        State Tax ({calcResult.texasNote ? `${calcResult.effectiveStateRate.toFixed(2)}%*` : `${calcResult.stateRate}%`})
                      </p>
                      <p className="text-lg font-semibold text-slate-900">${(calcResult.amount * calcResult.effectiveStateRate / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        Local Tax ({calcResult.texasNote ? `${calcResult.effectiveLocalRate.toFixed(2)}%*` : `${calcResult.localRate}%`})
                      </p>
                      <p className="text-lg font-semibold text-slate-900">${(calcResult.amount * calcResult.effectiveLocalRate / 100).toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-blue-600 font-medium">Total w/ Tax</p>
                      <p className="text-lg font-bold text-blue-700">${calcResult.total.toFixed(2)}</p>
                      <p className="text-xs text-blue-500">Tax: ${calcResult.tax.toFixed(2)}</p>
                    </div>
                  </div>
                  {calcResult.texasNote && (
                    <p className="text-xs text-blue-700 mt-3 bg-blue-50 rounded-md p-2">
                      * Texas 80% rule applied: SaaS is taxed as a data processing service at 80% of value. Nominal rate {calcResult.displayTotalRate.toFixed(2)}% → effective rate {calcResult.totalRate.toFixed(2)}%.
                    </p>
                  )}
                  {!calcResult.localRate && calcResult.state.maxLocalRate > 0 && (
                    <p className="text-xs text-amber-700 mt-2 bg-amber-50 rounded-md p-2">
                      ⚠ No local rate entered. {calcResult.state.name} has local rates up to {calcResult.state.maxLocalRate}%. Use the rate lookup link above to find the exact rate for your client's address.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === LOOKUP TAB === */}
        {tab === "lookup" && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by state name or abbreviation..."
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { key: "all", label: `All (${counts.all})` },
                  { key: "taxable", label: `Taxable (${counts.taxable})` },
                  { key: "exempt", label: `Exempt (${counts.exempt})` },
                  { key: "no_sales_tax", label: `No Tax (${counts.no_sales_tax})` },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      filter === f.key
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-1.5">
              {filtered.map(state => {
                const config = STATUS_CONFIG[state.saasStatus];
                const complexityConfig = COMPLEXITY_CONFIG[state.localComplexity];
                const isExpanded = expanded === state.abbr;
                return (
                  <div key={state.abbr} className={`bg-white rounded-lg border transition-all ${isExpanded ? `${config.border} shadow-md` : "border-slate-200 shadow-sm hover:border-slate-300"}`}>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : state.abbr)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dot}`} />
                        <span className="font-semibold text-slate-900 text-sm">{state.name}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0">{state.abbr}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${config.badge}`}>{config.label}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {state.saasStatus === "taxable" && (
                          <span className="text-xs text-slate-500 hidden sm:inline">
                            {state.stateRate}%{state.maxLocalRate > 0 ? ` + up to ${state.maxLocalRate}%` : ""}
                          </span>
                        )}
                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className={`px-4 pb-4 border-t ${config.border}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">SaaS Classification</p>
                            <p className="text-sm text-slate-800">{state.classification}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Economic Nexus Threshold</p>
                            <p className="text-sm text-slate-800">{state.nexus}</p>
                          </div>
                          {state.saasStatus === "taxable" && (
                            <>
                              <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">State Rate</p>
                                <p className="text-sm text-slate-800 font-semibold">
                                  {state.stateRate}%
                                  {state.abbr === "TX" && <span className="text-xs font-normal text-blue-600 ml-1">(effective ~{(state.stateRate * 0.8).toFixed(1)}% for SaaS)</span>}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Combined Rate Range</p>
                                <p className="text-sm text-slate-800">
                                  {state.maxLocalRate > 0
                                    ? `${state.stateRate}% – ${(state.stateRate + state.maxLocalRate).toFixed(2)}%`
                                    : `${state.stateRate}% (no local tax)`
                                  }
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Local Complexity Indicator */}
                        <div className={`mt-3 ${complexityConfig.bg} rounded-lg p-3 flex items-center gap-2`}>
                          <span className="text-sm">{complexityConfig.icon}</span>
                          <div>
                            <p className={`text-xs font-semibold ${complexityConfig.color}`}>Local Rate Complexity: {complexityConfig.label}</p>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-3 bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Compliance Notes</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{state.notes}</p>
                        </div>

                        {/* Lookup Tool - the key upgrade */}
                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Rate Lookup Tool</p>
                                <a href={state.lookupUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors">
                                  Look Up Exact Rate →
                                </a>
                              </div>
                              <p className="text-sm text-blue-700 mt-1.5 leading-relaxed">{state.lookupTip}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">No states match your search</p>
                <p className="text-slate-400 text-sm mt-1">Try a different name, abbreviation, or filter</p>
              </div>
            )}
          </div>
        )}

        {/* === SUMMARY TAB === */}
        {tab === "summary" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">SaaS Taxability at a Glance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-700">{counts.taxable}</p>
                  <p className="text-sm text-red-600 font-medium">States Tax SaaS</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-700">{counts.exempt}</p>
                  <p className="text-sm text-emerald-600 font-medium">States Exempt SaaS</p>
                </div>
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-sky-700">{counts.no_sales_tax}</p>
                  <p className="text-sm text-sky-600 font-medium">No Sales Tax</p>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 mb-2">Easiest Taxable States (flat rate, no local)</h3>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {sorted.filter(s => s.saasStatus === "taxable" && s.localComplexity === "none").map(s => (
                  <span key={s.abbr} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700">{s.abbr} ({s.stateRate}%)</span>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-emerald-700 mb-2">SaaS Exempt (no tax to collect)</h3>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {sorted.filter(s => s.saasStatus === "exempt").map(s => (
                  <span key={s.abbr} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-medium text-emerald-700">{s.abbr}</span>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-sky-700 mb-2">No Sales Tax</h3>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {sorted.filter(s => s.saasStatus === "no_sales_tax").map(s => (
                  <span key={s.abbr} className="px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-md text-xs font-medium text-sky-700">{s.abbr}</span>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-red-700 mb-2">High Local Complexity (always look up rate)</h3>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {sorted.filter(s => s.localComplexity === "high").map(s => (
                  <span key={s.abbr} className="px-2.5 py-1 bg-red-50 border border-red-200 rounded-md text-xs font-medium text-red-700">{s.abbr}</span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Watch-Out States</h2>
              <div className="space-y-3">
                {[
                  { title: "Highest Combined Rates", detail: "Tennessee (9.75%), Louisiana (11.45%), Alabama (11.5%), Arkansas (11.6%) — local rates stack aggressively on top of already-high state rates." },
                  { title: "Most Complex Local Systems", detail: "Louisiana (separate parish agencies), Colorado (home-rule cities that may tax SaaS despite state exemption), Arizona (city-level TPT), New Mexico (destination-based GRT with municipal variations)." },
                  { title: "Unusual Tax Structures", detail: "Hawaii (GET pass-through = 4.166%, not 4.0%), New Mexico (GRT, not sales tax), Texas (80% rule = effective rate lower than stated), Washington (B&O tax on seller's revenue in addition to sales tax)." },
                  { title: "Exempt-But-Watch-Out States", detail: "Colorado (home-rule cities may tax SaaS despite state exemption), Illinois/Chicago (city-level Amusement Tax may apply to cloud services), North Carolina (under active review — may change)." },
                  { title: "Higher Nexus Thresholds", detail: "New York ($500K + 100 txns), Texas ($500K), Mississippi ($250K), Alabama ($250K), California ($500K for tangible) — smaller sellers may not meet these thresholds." },
                ].map((item, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-amber-800">{item.title}</p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-2">
            <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <div>
              <p className="text-xs text-amber-800 font-semibold">Important Disclaimer</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                This tool is a reference guide, not legal or tax advice. SaaS taxability rules and rates change. Always verify current rates with the state's rate lookup tool before billing. For companies billing across many states, consider Avalara, TaxJar, or Vertex ($50-500/mo) for automated real-time compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
