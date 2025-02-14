import { AlignmentType } from 'docx';


export interface PremiumDetail {
  group_details: string;
  tob_header: string;
  tob_value: string;
}

export interface Category {
  category_name: string;
  premium_details: PremiumDetail[];
}

export interface CensusCategory {
  category_name: string;
  census: {}[];
}

export interface Exclusion {
  heading: string;
  bulletPoints: string[];
  title: string;
}

export interface EmirateData {
  emirates: string;
  exclusions: Exclusion[];
}

export interface PdfAgeBandDetail {
  age: string;
  maternityCount: number;
  maternityGrossPremium: number;
  maternityTotalGrossPremium: number;
  Employee: any;  // Replace with the correct type for Employee
  Dependents: any;  // Replace with the correct type for Dependents
}


export interface agebandData {
  category_name: string;
  pdfAgeBandDetails: PdfAgeBandDetail[];
  census: {}[];
  // emirates:string;

}


// Define the CellOptions interface
type AlignmentTypeEnum = typeof AlignmentType[keyof typeof AlignmentType];
export interface CellOptions {
  bold?: boolean;
  fontSize?: number;
  fillColor?: string;
  color?: string;
  alignment?: AlignmentTypeEnum;  // Correctly specify alignment as part of the enum
  rowSpan?: number;
  colSpan?: number;
  width?: {
    size: number; // Width size in percentage or points
    type: "pct";
  };
  borderColor?:string
  marginRight?:number
}

export interface TextLineOptions {
  text: string;
  size?: number;
  bold?: boolean;
  before?: number;
  after?: number;
  alignment?: any;
  color?: string;
  leftIndent?: number; // Optional left indent
}

export interface BenefitData {
    group_details: string;
    tob_header: string;
    tob_value: string;
  }
  
  export interface CategoryData {
    category_name: string;
    data: { [key: string]: BenefitData[] };
  }
  
  export interface GroupedBenefits {
    [groupDetails: string]: { category: string; tob_header: string; tob_value: string }[];
  }
  
  export interface UniqueBenefitHeader {
    group: string;
    header: string;
    index: number;
  }

  export interface ListItem {
    type: string;
    level: number;
    text: string;
    bold?: boolean;
    nestedList?: ListItem[]; // Add nestedList property
  }
  

let data = {
  "Policy Details": [
      {
          "tob_header": "Plan",
          "category_name": "Category A",
          "tob_value": "Plan1 GN+"
      },
      {
          "tob_header": "TPA",
          "category_name": "Category A",
          "tob_value": "Nextcare"
      },
      {
          "tob_header": "Territorial Scope of Coverage",
          "category_name": "Category A",
          "tob_value": "Worldwide "
      },
      {
          "tob_header": "Aggregate Annual Limit",
          "category_name": "Category A",
          "tob_value": "AED 2 Million"
      },
      {
          "tob_header": "Medical Network ",
          "category_name": "Category A",
          "tob_value": "NEXTCARE GN+"
      },
      {
          "tob_header": "Pre-existing & Chronic Conditions",
          "category_name": "Category A",
          "tob_value": "Covered up to the Annual limit subject to the following:\r\n\r\nAnnual limit applies if evidence of continuity of coverage (COC) in UAE is provided; otherwise, the limit will be restricted to AED 150,000/- PPPA. \r\n\r\nPre-existing and/or ongoing chronic conditions should be declared as per the Group Health Declaration form and/or in the medical application form (MAF) for all members above 60 years old and for all the groups below 20 members and is subject to medical underwriting. Undeclared medical conditions will not be covered during the policy period.\r\n \r\nAny form of Cancer shall fall within the definition of Chronic conditions."
      },
      {
          "tob_header": "Plan",
          "category_name": "Category B",
          "tob_value": "Plan2 GN"
      },
      {
          "tob_header": "TPA",
          "category_name": "Category B",
          "tob_value": "Nextcare"
      },
      {
          "tob_header": "Territorial Scope of Coverage",
          "category_name": "Category B",
          "tob_value": "Worldwide "
      },
      {
          "tob_header": "Aggregate Annual Limit",
          "category_name": "Category B",
          "tob_value": "AED 1 Million"
      },
      {
          "tob_header": "Medical Network ",
          "category_name": "Category B",
          "tob_value": "NEXTCARE GN"
      },
      {
          "tob_header": "Pre-existing & Chronic Conditions",
          "category_name": "Category B",
          "tob_value": "Covered up to Annual Limit\r\nMAF is mandatory for all members above 60 years old and for all the groups below 20 members "
      },
      {
          "tob_header": "Plan",
          "category_name": "Category C",
          "tob_value": "Plan2 RN"
      },
      {
          "tob_header": "TPA",
          "category_name": "Category C",
          "tob_value": "Nextcare"
      },
      {
          "tob_header": "Territorial Scope of Coverage",
          "category_name": "Category C",
          "tob_value": "Worldwide "
      },
      {
          "tob_header": "Aggregate Annual Limit",
          "category_name": "Category C",
          "tob_value": "AED 1 Million"
      },
      {
          "tob_header": "Medical Network ",
          "category_name": "Category C",
          "tob_value": "NEXTCARE RN"
      },
      {
          "tob_header": "Pre-existing & Chronic Conditions",
          "category_name": "Category C",
          "tob_value": "Covered up to the Annual limit subject to the following:\r\n\r\nAnnual limit applies if evidence of continuity of coverage (COC) in UAE is provided; otherwise, the limit will be restricted to AED 150,000/- PPPA. \r\n\r\nPre-existing and/or ongoing chronic conditions should be declared as per the Group Health Declaration form and/or in the medical application form (MAF) for all members above 60 years old and for all the groups below 20 members and is subject to medical underwriting. Undeclared medical conditions will not be covered during the policy period.\r\n \r\nAny form of Cancer shall fall within the definition of Chronic conditions."
      },
      {
          "tob_header": "Plan",
          "category_name": "Category D",
          "tob_value": "Plan3 RN2"
      },
      {
          "tob_header": "TPA",
          "category_name": "Category D",
          "tob_value": "Nextcare"
      },
      {
          "tob_header": "Territorial Scope of Coverage",
          "category_name": "Category D",
          "tob_value": "Worldwide "
      },
      {
          "tob_header": "Aggregate Annual Limit",
          "category_name": "Category D",
          "tob_value": "AED 1 Million"
      },
      {
          "tob_header": "Medical Network ",
          "category_name": "Category D",
          "tob_value": "NEXTCARE RN2"
      },
      {
          "tob_header": "Pre-existing & Chronic Conditions",
          "category_name": "Category D",
          "tob_value": "Covered up to the Annual limit subject to the following:\r\n\r\nAnnual limit applies if evidence of continuity of coverage (COC) in UAE is provided; otherwise, the limit will be restricted to AED 150,000/- PPPA. \r\n\r\nPre-existing and/or ongoing chronic conditions should be declared as per the Group Health Declaration form and/or in the medical application form (MAF) for all members above 60 years old and for all the groups below 20 members and is subject to medical underwriting. Undeclared medical conditions will not be covered during the policy period.\r\n \r\nAny form of Cancer shall fall within the definition of Chronic conditions."
      },
      {
          "tob_header": "Plan",
          "category_name": "Category E",
          "tob_value": "Plan2 RN"
      },
      {
          "tob_header": "TPA",
          "category_name": "Category E",
          "tob_value": "Nextcare"
      },
      {
          "tob_header": "Territorial Scope of Coverage",
          "category_name": "Category E",
          "tob_value": "Worldwide "
      },
      {
          "tob_header": "Aggregate Annual Limit",
          "category_name": "Category E",
          "tob_value": "AED 1 Million"
      },
      {
          "tob_header": "Medical Network ",
          "category_name": "Category E",
          "tob_value": "NEXTCARE RN"
      },
      {
          "tob_header": "Pre-existing & Chronic Conditions",
          "category_name": "Category E",
          "tob_value": "Covered up to Annual Limit\r\nMAF is mandatory for all members above 60 years old and for all the groups below 20 members "
      },
      {
          "tob_header": "Plan",
          "category_name": "Category F",
          "tob_value": "Plan5 RN2 (IP) / RN3 Clinics Only (OP)"
      },
      {
          "tob_header": "TPA",
          "category_name": "Category F",
          "tob_value": "Nextcare"
      },
      {
          "tob_header": "Territorial Scope of Coverage",
          "category_name": "Category F",
          "tob_value": "Worldwide "
      },
      {
          "tob_header": "Aggregate Annual Limit",
          "category_name": "Category F",
          "tob_value": "AED 250,000"
      },
      {
          "tob_header": "Medical Network ",
          "category_name": "Category F",
          "tob_value": "NEXTCARE RN2 (IP) / RN3 Clinics Only (OP)"
      },
      {
          "tob_header": "Pre-existing & Chronic Conditions",
          "category_name": "Category F",
          "tob_value": "Covered up to the Annual limit subject to the following:\r\n\r\nAnnual limit applies if evidence of continuity of coverage (COC) in UAE is provided; otherwise, the limit will be restricted to AED 150,000/- PPPA. \r\n\r\nPre-existing and/or ongoing chronic conditions should be declared as per the Group Health Declaration form and/or in the medical application form (MAF) for all members above 60 years old and for all the groups below 20 members and is subject to medical underwriting. Undeclared medical conditions will not be covered during the policy period.\r\n \r\nAny form of Cancer shall fall within the definition of Chronic conditions."
      }
  ],
  "General": [
      {
          "tob_header": "Regulatory Compliance",
          "category_name": "Category A",
          "tob_value": "DHA"
      },
      {
          "tob_header": "Regulatory Compliance",
          "category_name": "Category B",
          "tob_value": "DOH"
      },
      {
          "tob_header": "Regulatory Compliance",
          "category_name": "Category C",
          "tob_value": "Non-DHA"
      },
      {
          "tob_header": "Regulatory Compliance",
          "category_name": "Category D",
          "tob_value": "DHA"
      },
      {
          "tob_header": "Regulatory Compliance",
          "category_name": "Category E",
          "tob_value": "DOH"
      },
      {
          "tob_header": "Regulatory Compliance",
          "category_name": "Category F",
          "tob_value": "Non-DHA"
      }
  ],
  "In-patient & Day Care Health Services at Authorized Hospitals": [
      {
          "tob_header": "In-patient Room Type",
          "category_name": "Category A",
          "tob_value": "Private"
      },
      {
          "tob_header": "Parent Accommodation for child under 18 years of age",
          "category_name": "Category A",
          "tob_value": "AED 450 / day"
      },
      {
          "tob_header": "Accommodation of an accompanying person in the same room as per recommendation of attending physician, subject to prior approval.",
          "category_name": "Category A",
          "tob_value": "AED 450 / day"
      },
      {
          "tob_header": "In-patient Room Type",
          "category_name": "Category B",
          "tob_value": "Private"
      },
      {
          "tob_header": "Parent Accommodation for child under 18 years of age",
          "category_name": "Category B",
          "tob_value": "AED 350 / day"
      },
      {
          "tob_header": "Accommodation of an accompanying person in the same room as per recommendation of attending physician, subject to prior approval.",
          "category_name": "Category B",
          "tob_value": "AED 350 / day"
      },
      {
          "tob_header": "In-patient Room Type",
          "category_name": "Category C",
          "tob_value": "Private"
      },
      {
          "tob_header": "Parent Accommodation for child under 18 years of age",
          "category_name": "Category C",
          "tob_value": "AED 350 / day"
      },
      {
          "tob_header": "Accommodation of an accompanying person in the same room as per recommendation of attending physician, subject to prior approval.",
          "category_name": "Category C",
          "tob_value": "AED 350 / day"
      },
      {
          "tob_header": "In-patient Room Type",
          "category_name": "Category D",
          "tob_value": "Semi-Private"
      },
      {
          "tob_header": "Parent Accommodation for child under 18 years of age",
          "category_name": "Category D",
          "tob_value": "AED 250 / day"
      },
      {
          "tob_header": "Accommodation of an accompanying person in the same room as per recommendation of attending physician, subject to prior approval.",
          "category_name": "Category D",
          "tob_value": "AED 250 / day"
      },
      {
          "tob_header": "In-patient Room Type",
          "category_name": "Category E",
          "tob_value": "Private"
      },
      {
          "tob_header": "Parent Accommodation for child under 18 years of age",
          "category_name": "Category E",
          "tob_value": "AED 350 / day"
      },
      {
          "tob_header": "Accommodation of an accompanying person in the same room as per recommendation of attending physician, subject to prior approval.",
          "category_name": "Category E",
          "tob_value": "AED 350 / day"
      },
      {
          "tob_header": "In-patient Room Type",
          "category_name": "Category F",
          "tob_value": "Semi-Private"
      },
      {
          "tob_header": "Parent Accommodation for child under 18 years of age",
          "category_name": "Category F",
          "tob_value": "AED 150 / day"
      },
      {
          "tob_header": "Accommodation of an accompanying person in the same room as per recommendation of attending physician, subject to prior approval.",
          "category_name": "Category F",
          "tob_value": "AED 150 / day"
      }
  ],
  "Out-patient Health Services": [
      {
          "tob_header": "Consultation",
          "category_name": "Category A",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Deductible per Consultation (will not be applicable for follow-up within 7 days for same treatment and with same doctor)",
          "category_name": "Category A",
          "tob_value": "20% Max AED 50/-"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines Annual Limit",
          "category_name": "Category A",
          "tob_value": "AED 10000"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines ",
          "category_name": "Category A",
          "tob_value": "20% Co-pay"
      },
      {
          "tob_header": "Diagnostics ( X-ray, MRI, CT-Scan, Ultra Sound& Endoscopy diagonistic services )\r\nCovered Subject to Co-pay and up to aggregate annual limit",
          "category_name": "Category A",
          "tob_value": "20% Co-pay"
      },
      {
          "tob_header": "Consultation",
          "category_name": "Category B",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Deductible per Consultation (will not be applicable for follow-up within 7 days for same treatment and with same doctor)",
          "category_name": "Category B",
          "tob_value": "AED 50/-"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines Annual Limit",
          "category_name": "Category B",
          "tob_value": "AED 7500"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines ",
          "category_name": "Category B",
          "tob_value": "20% Co-pay"
      },
      {
          "tob_header": "Diagnostics ( X-ray, MRI, CT-Scan, Ultra Sound& Endoscopy diagonistic services )",
          "category_name": "Category B",
          "tob_value": "Covered without Co-pay and up to aggregate annual limit"
      },
      {
          "tob_header": "Consultation",
          "category_name": "Category C",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Deductible per Consultation (will not be applicable for follow-up within 7 days for same treatment and with same doctor)",
          "category_name": "Category C",
          "tob_value": "20% Max AED 50/-"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines Annual Limit",
          "category_name": "Category C",
          "tob_value": "AED 7500"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines ",
          "category_name": "Category C",
          "tob_value": "20% Co-pay"
      },
      {
          "tob_header": "Diagnostics ( X-ray, MRI, CT-Scan, Ultra Sound& Endoscopy diagonistic services )\r\nCovered Subject to Co-pay and up to aggregate annual limit",
          "category_name": "Category C",
          "tob_value": "20% Co-pay"
      },
      {
          "tob_header": "Consultation",
          "category_name": "Category D",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Deductible per Consultation (will not be applicable for follow-up within 7 days for same treatment and with same doctor)",
          "category_name": "Category D",
          "tob_value": "20% Max AED 50/-"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines Annual Limit",
          "category_name": "Category D",
          "tob_value": "AED 5000"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines ",
          "category_name": "Category D",
          "tob_value": "20% Co-pay"
      },
      {
          "tob_header": "Diagnostics ( X-ray, MRI, CT-Scan, Ultra Sound& Endoscopy diagonistic services )\r\nCovered Subject to Co-pay and up to aggregate annual limit",
          "category_name": "Category D",
          "tob_value": "20% Co-pay"
      },
      {
          "tob_header": "Consultation",
          "category_name": "Category E",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Deductible per Consultation (will not be applicable for follow-up within 7 days for same treatment and with same doctor)",
          "category_name": "Category E",
          "tob_value": "AED 50/-"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines Annual Limit",
          "category_name": "Category E",
          "tob_value": "AED 7500"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines ",
          "category_name": "Category E",
          "tob_value": "20% Co-pay"
      },
      {
          "tob_header": "Diagnostics ( X-ray, MRI, CT-Scan, Ultra Sound& Endoscopy diagonistic services )",
          "category_name": "Category E",
          "tob_value": "Covered without Co-pay and up to aggregate annual limit"
      },
      {
          "tob_header": "Consultation",
          "category_name": "Category F",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Deductible per Consultation (will not be applicable for follow-up within 7 days for same treatment and with same doctor)",
          "category_name": "Category F",
          "tob_value": "20% Max AED 50/-"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines Annual Limit",
          "category_name": "Category F",
          "tob_value": "AED 3000"
      },
      {
          "tob_header": "Prescribed Drugs & Medicines ",
          "category_name": "Category F",
          "tob_value": "20% Co-pay"
      },
      {
          "tob_header": "Diagnostics ( X-ray, MRI, CT-Scan, Ultra Sound& Endoscopy diagonistic services )\r\nCovered Subject to Co-pay and up to aggregate annual limit",
          "category_name": "Category F",
          "tob_value": "20% Co-pay"
      }
  ],
  "Other Benefits ": [
      {
          "tob_header": "Home Nursing Hospitalization",
          "category_name": "Category A",
          "tob_value": "Covered up to Maximum AED 15,000 per person per annum"
      },
      {
          "tob_header": "Emergency road ambulance services to and from hospital by registered ambulance services provider",
          "category_name": "Category A",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Cash Indemnity for In-Patient Treatment post hospitlization up to max of 15 days, subject to providing discharge summary or proof of hospitalization",
          "category_name": "Category A",
          "tob_value": "AED 300 per night\r\nApplicable to all inpatient hospitalizations that are not submitted to the Insurance Company"
      },
      {
          "tob_header": "Essential vaccinations and inoculations for newborns and children as stipulated in the DHA’s policies and its updates (currently the same as Federal MOH)",
          "category_name": "Category A",
          "tob_value": "Inside Network: 100% Actual Cost\r\nOutside Network : UCR Basis "
      },
      {
          "tob_header": "Physiotherapy ( Subject to pre-approval) ",
          "category_name": "Category A",
          "tob_value": "20 sessions per member per annum"
      },
      {
          "tob_header": "Preventive services, vaccines and immunizations",
          "category_name": "Category A",
          "tob_value": "Frequency restricted to:\r\nDiabetes: Every 3 years from age 30\r\nHigh risk individuals annually from age 18"
      },
      {
          "tob_header": "Diagnostic and treatment services for dental and gum treatments( Emergency cases Only) \r\nDental emergency is any injury to your teeth or gums that can put you at a risk of permanent damage, such as Chipped or broken teeth, Knocked-out tooth ,Soft-tissue injuries and etc",
          "category_name": "Category A",
          "tob_value": "Covered "
      },
      {
          "tob_header": "Hearing and vision aids, and vision correction by surgeries and laser ( Emergency cases Only)\r\nHearing Emergencies include Object/insect in the ear , ruptued eardrum ,  sudden hearing loss and etc\r\nVision Emergencies include  bleeding or discharge from or around the eye, double vision and Loss of vision, total or partial, one eye or both etc.",
          "category_name": "Category A",
          "tob_value": "Covered "
      },
      {
          "tob_header": "Kidney Dialysis Treatment\r\nCoverage for hemodialysis or peritoneal dialysis",
          "category_name": "Category A",
          "tob_value": "Covered up to Maximum AED 35,000 per person per annum"
      },
      {
          "tob_header": "Healthcare services for work illnesses and injuries as per Federal Law No.8 of 1980 concerning the Regulation of Work Relations, as amended, and applicable laws in this respect",
          "category_name": "Category A",
          "tob_value": "Covered up to Maximum AED 10,000 per person per annum"
      },
      {
          "tob_header": "Adult Pneumococcal Conjugate Vaccine",
          "category_name": "Category A",
          "tob_value": "Covered as per DHA Adult Pneumococcal Vaccination guidelines"
      },
      {
          "tob_header": "Cancer Treatment\r\n Screening, Healthcare Services, Investigations and Treatments only for members enrolled under Patient Support Program only",
          "category_name": "Category A",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
      },
      {
          "tob_header": "Hepatitis B & C Virus Screening and Treatment\r\n Screening, Healthcare Services, Investigations and Treatments only for members enrolled under Patient Support Program only",
          "category_name": "Category A",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
      },
      {
          "tob_header": "Influenza Vaccine",
          "category_name": "Category A",
          "tob_value": "Covered once per Annum"
      },
      {
          "tob_header": "Psychiatric and Mental Health",
          "category_name": "Category A",
          "tob_value": "In-Patient, Out-Patient, and Emergency cover up to a maximum of AED 10,000/- per person per annum.\r\n\r\n20% coinsurance payable by the insured per visit for Out-Patient services.\r\nNo coinsurance is applicable if a follow-up vist is made within seven days"
      },
      {
          "tob_header": "Repatriation of Mortal Remains to the Country of Domicile:",
          "category_name": "Category A",
          "tob_value": "Covered up to Maximum AED 25,000 per person per annum settled on Reimbursement basis with no co-pay"
      },
      {
          "tob_header": "Second Medical Opinion",
          "category_name": "Category A",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to world renowned  providers to re-evaluate their earlier diagnosis, medical history and treatment plan for non-emergency cases.\r\nCardholder is entitled to use the Second Medical Opinion service two times within the 12 months Policy validity period. "
      },
      {
          "tob_header": "Symptom Checker",
          "category_name": "Category A",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a tool that uses artificial intelligence algorithms to anonymously analyze the member’s symptoms and medical history to suggest the most probable diagnosis and route of care. "
      },
      {
          "tob_header": "Dental benefit\r\n(Enhanced coverage is subject to additional premium)\r\nCovers the following: Consultation & X-Ray, Scaling & Polishing, Tooth Extraction, Amalgam fillings, Temporary and/or permanent composite, fillings and root canal treatment only.",
          "category_name": "Category A",
          "tob_value": "Limited to AED 500/- subject to 30% Co-pay\r\nIn-Network: Direct Billing\r\nOut of Network: Reimbursement "
      },
      {
          "tob_header": "Optical benefit (Subject to Additonal Premium) covers the following:  Optical examinations conducted for the purpose of obtaining eye glasses or lenses, Consultation by an ophthalmologist, Sight testing, Medication (included within the optical benefit)\r\nSubject to following Sub Limits:\r\nAED 300/- per pair per single vision lenses\r\nAED 400/- per pair per bifocal or tri-focal vision lenses\r\nAED 500/- per pair of contact lenses\r\nAED 500/- per frame per year",
          "category_name": "Category A",
          "tob_value": "Not Covered"
      },
      {
          "tob_header": "Alternative Medicine\r\nCovers the following: Ayurveda, Chiropractic, Chinese Medicine, and Homeopathy",
          "category_name": "Category A",
          "tob_value": "Limited to AED 3,500 per person per annum\r\n\r\n20% coinsurance payable by the insured per visit. No coinsurance is applicable if a follow-up visit is made within seven days\r\n\r\nThe claims will be settled on reimbursement basis, and only from providers which are recognized and approved by Nextcare as alternative preferred providers - refer to Nextcare website for details"
      },
      {
          "tob_header": "Organ Transplant",
          "category_name": "Category A",
          "tob_value": "Organ transplantation shall cover the organ transplantation as recipient excluding any cost related to donor, and excluding the acquisition and organ cost\r\nOrgans covered are: heart, lung, kidney, pancreas, liver, Allogeneic & autologous bone marrow."
      },
      {
          "tob_header": "New Born Cover",
          "category_name": "Category A",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions defined by DHA."
      },
      {
          "tob_header": "Medical Advice Service “See A Doctor” (UAE)",
          "category_name": "Category A",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a qualified doctor, for general medical advice and instructions for self-care or recommendations on medications. For users calling from the UAE only, the physician can issue a prescription for the recommended medications. The service can only be accessed during the validity period of the policy coverage."
      },
      {
          "tob_header": "Return Airfare Ticket \r\nfor In-Patient treatment at home country",
          "category_name": "Category A",
          "tob_value": "This benefit can be covered subject to the following guidelines:\r\n\r\n - Cost of In-Patient treatment at home country is 50% or less compared to the cost of the same treatment and applicable network charges in UAE\r\n - Covered only for the patient (i.e. excluding accompanying persons)\r\n - Only on reimbursement basis, and subject to pre-approval\r\n - Covered up to a maximum of AED 3,000 for the round trip ticket"
      },
      {
          "tob_header": "Wellness Benefit",
          "category_name": "Category A",
          "tob_value": "Coverage for an Annual Health Check-up Package with NEXtCARE partner providers, subject to a 20% coinsurance and the following annual limits (as per the member's Medical Out-Patient Network): \r\n\r\nGN+ :   AED 1,500\r\nGN :   AED 1,000\r\nGN Excluding Mediclinic, Al Zahra & HMG and RN :  AED 500\r\nRN2 :   Not Covered\r\nRN3 :   Not Covered\r\n\r\nMember to check with NEXtCARE the latest list of approved packages. Coverage on Reimbursement basis only."
      },
      {
          "tob_header": "Home Nursing Hospitalization",
          "category_name": "Category B",
          "tob_value": "Covered up to Maximum AED 10,000 per person per annum"
      },
      {
          "tob_header": "Emergency road ambulance services to and from hospital by registered ambulance services provider",
          "category_name": "Category B",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Cash Indemnity for In-Patient Treatment post hospitlization up to max of 15 days, subject to providing discharge summary or proof of hospitalization",
          "category_name": "Category B",
          "tob_value": "AED 200 per night\r\nApplicable to all inpatient hospitalizations that are not submitted to the Insurance Company"
      },
      {
          "tob_header": "Vaccination for Children ( as per MOH, UAE)",
          "category_name": "Category B",
          "tob_value": "Inside Network: 100% Actual Cost\r\nOutside Network : UCR Basis "
      },
      {
          "tob_header": "Physiotherapy ( Subject to pre-approval) ",
          "category_name": "Category B",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Diagnostic and treatment services for dental and gum treatments, Hearing and vision aids, and vision correction by surgeries and laser (Emergency cases Only)\r\nDental emergency is any injury to your teeth or gums that can put you at a risk of permanent damage, such as Chipped or broken teeth, Knocked-out tooth ,Soft-tissue injuries and etc\r\nHearing Emergencies include Object/insect in the ear , ruptued eardrum ,  sudden hearing loss and etc\r\nVision Emergencies include  bleeding or discharge from or around the eye, double vision and Loss of vision, total or partial, one eye or both etc.",
          "category_name": "Category B",
          "tob_value": "Covered "
      },
      {
          "tob_header": "Kidney Dialysis Treatment\r\nCoverage for hemodialysis or peritoneal dialysis",
          "category_name": "Category B",
          "tob_value": "Covered up to Maximum AED 35,000 per person per annum"
      },
      {
          "tob_header": "Healthcare services for work illnesses and injuries as per Federal Law No.8 of 1980 concerning the Regulation of Work Relations, as amended, and applicable laws in this respect",
          "category_name": "Category B",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Transient mental disorder or acute reaction to stress",
          "category_name": "Category B",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Repatriation of Mortal Remains to the Country of Domicile:",
          "category_name": "Category B",
          "tob_value": "Covered up to Maximum AED 20,000 per person per annum"
      },
      {
          "tob_header": "Second Medical Opinion",
          "category_name": "Category B",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to world renowned  providers to re-evaluate their earlier diagnosis, medical history and treatment plan for non-emergency cases.\r\nCardholder is entitled to use the Second Medical Opinion service two times within the 12 months Policy validity period."
      },
      {
          "tob_header": "Symptom Checker",
          "category_name": "Category B",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a tool that uses artificial intelligence algorithms to anonymously analyze the member’s symptoms and medical history to suggest the most probable diagnosis and route of care."
      },
      {
          "tob_header": "Dental benefit ( subject to additional premium)\r\nCovers the following: Consultation & X-Ray, Scaling & Polishing, Tooth Extraction, Amalgam fillings, Temporary and/or permanent composite, fillings and root canal treatment only.",
          "category_name": "Category B",
          "tob_value": "Not Covered"
      },
      {
          "tob_header": "Optical benefit ( subject to additional premium)\r\nCovers the following:  Optical examinations conducted for the purpose of obtaining eye glasses or  lenses, Consultation by an ophthalmologist, Sight testing, Medication (included within the optical benefit)                                                                                       \r\n           \r\nSubject to following Sub Limits :\r\nAED 300/- per pair per single vision lenses.\r\nAED 400/- per pair per bifocal or tri-focal vision lenses.\r\nAED 500/- per pair of contact lenses\r\nAED 500/- per frame per year",
          "category_name": "Category B",
          "tob_value": "Not Covered"
      },
      {
          "tob_header": "Alternative Medicine\r\nCovers the following: Ayurveda, Chiropractic, Chinese Medicine, and Homeopathy",
          "category_name": "Category B",
          "tob_value": "Limited to AED 2,000 per person per annum\r\n\r\n20% coinsurance payable by the insured per visit. No coinsurance is applicable if a follow-up visit is made within seven days\r\n\r\nThe claims will be settled on reimbursement basis, and only from providers which are recognized and approved by Nextcare as alternative preferred providers - refer to Nextcare website for details"
      },
      {
          "tob_header": "Organ Transplant",
          "category_name": "Category B",
          "tob_value": "Organ transplantation shall cover the organ transplantation as recipient excluding any cost related to donor, and excluding the acquisition and organ cost\r\nOrgans covered are: heart, lung, kidney, pancreas, liver, Allogeneic & autologous bone marrow."
      },
      {
          "tob_header": "Medical Advice Service “See A Doctor” (UAE)",
          "category_name": "Category B",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a highly qualified doctor, for general medical advice and instructions for self-care or recommendations on medications. For users calling from the UAE only, the physician can issue a prescription for the recommended medications. The service can only be accessed during the validity period of the policy coverage."
      },
      {
          "tob_header": "Return Airfare Ticket \r\nfor In-Patient treatment at home country",
          "category_name": "Category B",
          "tob_value": "This benefit can be covered subject to the following guidelines:\r\n \r\n - Cost of In-Patient treatment at home country is 50% or less compared to the cost of the same treatment and applicable network charges in UAE\r\n - Covered only for the patient (i.e. excluding accompanying persons)\r\n - Only on reimbursement basis, and subject to pre-approval\r\n - Covered up to a maximum of AED 3,000 for the round trip ticket"
      },
      {
          "tob_header": "Wellness Benefit",
          "category_name": "Category B",
          "tob_value": "Coverage for an Annual Health Check-up Package with NEXtCARE partner providers, subject to a 20% coinsurance and the following annual limits (as per the member's Medical Out-Patient Network): \r\n\r\nGN+ : AED 1,500\r\nGN : AED 1,000\r\nRN : AED 500\r\nRN2 : Not Covered\r\nRN3 : Not Covered\r\n\r\nMember to check with NEXtCARE the latest list of approved packages. Coverage on Reimbursement basis only."
      },
      {
          "tob_header": "Home Nursing Hospitalization",
          "category_name": "Category C",
          "tob_value": "Covered up to Maximum AED 10,000 per person per annum"
      },
      {
          "tob_header": "Emergency road ambulance services to and from hospital by registered ambulance services provider",
          "category_name": "Category C",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Cash Indemnity for In-Patient Treatment post hospitlization up to max of 15 days, subject to providing discharge summary or proof of hospitalization",
          "category_name": "Category C",
          "tob_value": "AED 250 per night\r\nApplicable to all inpatient hospitalizations that are not submitted to the Insurance Company"
      },
      {
          "tob_header": "Essential vaccinations and inoculations for newborns and children as stipulated in the DHA’s policies and its updates (currently the same as Federal MOH)",
          "category_name": "Category C",
          "tob_value": "Inside Network: 100% Actual Cost\r\nOutside Network : UCR Basis "
      },
      {
          "tob_header": "Physiotherapy ( Subject to pre-approval) ",
          "category_name": "Category C",
          "tob_value": "20 sessions per member per annum"
      },
      {
          "tob_header": "Preventive services, vaccines and immunizations",
          "category_name": "Category C",
          "tob_value": "Frequency restricted to:\r\nDiabetes: Every 3 years from age 30\r\nHigh risk individuals annually from age 18"
      },
      {
          "tob_header": "Diagnostic and treatment services for dental and gum treatments( Emergency cases Only) \r\nDental emergency is any injury to your teeth or gums that can put you at a risk of permanent damage, such as Chipped or broken teeth, Knocked-out tooth ,Soft-tissue injuries and etc",
          "category_name": "Category C",
          "tob_value": "Covered "
      },
      {
          "tob_header": "Hearing and vision aids, and vision correction by surgeries and laser ( Emergency cases Only)\r\nHearing Emergencies include Object/insect in the ear , ruptued eardrum ,  sudden hearing loss and etc\r\nVision Emergencies include  bleeding or discharge from or around the eye, double vision and Loss of vision, total or partial, one eye or both etc.",
          "category_name": "Category C",
          "tob_value": "Covered "
      },
      {
          "tob_header": "Kidney Dialysis Treatment\r\nCoverage for hemodialysis or peritoneal dialysis",
          "category_name": "Category C",
          "tob_value": "Covered up to Maximum AED 35,000 per person per annum"
      },
      {
          "tob_header": "Healthcare services for work illnesses and injuries as per Federal Law No.8 of 1980 concerning the Regulation of Work Relations, as amended, and applicable laws in this respect",
          "category_name": "Category C",
          "tob_value": "Covered up to Maximum AED 10,000 per person per annum"
      },
      {
          "tob_header": "Adult Pneumococcal Conjugate Vaccine",
          "category_name": "Category C",
          "tob_value": "Covered as per DHA Adult Pneumococcal Vaccination guidelines"
      },
      {
          "tob_header": "Cancer Treatment\r\n Screening, Healthcare Services, Investigations and Treatments only for members enrolled under Patient Support Program only",
          "category_name": "Category C",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
      },
      {
          "tob_header": "Hepatitis B & C Virus Screening and Treatment\r\n Screening, Healthcare Services, Investigations and Treatments only for members enrolled under Patient Support Program only",
          "category_name": "Category C",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
      },
      {
          "tob_header": "Influenza Vaccine",
          "category_name": "Category C",
          "tob_value": "Covered once per Annum"
      },
      {
          "tob_header": "Psychiatric and Mental Health",
          "category_name": "Category C",
          "tob_value": "In-Patient, Out-Patient, and Emergency cover up to a maximum of AED 10,000/- per person per annum.\r\n\r\n20% coinsurance payable by the insured per visit for Out-Patient services.\r\nNo coinsurance is applicable if a follow-up vist is made within seven days"
      },
      {
          "tob_header": "Repatriation of Mortal Remains to the Country of Domicile:",
          "category_name": "Category C",
          "tob_value": "Covered up to Maximum AED 20,000 per person per annum settled on Reimbursement basis with no co-pay"
      },
      {
          "tob_header": "Second Medical Opinion",
          "category_name": "Category C",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to world renowned  providers to re-evaluate their earlier diagnosis, medical history and treatment plan for non-emergency cases.\r\nCardholder is entitled to use the Second Medical Opinion service two times within the 12 months Policy validity period. "
      },
      {
          "tob_header": "Symptom Checker",
          "category_name": "Category C",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a tool that uses artificial intelligence algorithms to anonymously analyze the member’s symptoms and medical history to suggest the most probable diagnosis and route of care. "
      },
      {
          "tob_header": "Dental benefit (Subject to Additonal Premium)\r\nCovers the following: Consultation & X-Ray, Scaling & Polishing, Tooth Extraction, Amalgam fillings, Temporary and/or permanent composite, fillings and root canal treatment only.",
          "category_name": "Category C",
          "tob_value": "Not Covered"
      },
      {
          "tob_header": "Optical benefit (Subject to Additonal Premium) covers the following:  Optical examinations conducted for the purpose of obtaining eye glasses or lenses, Consultation by an ophthalmologist, Sight testing, Medication (included within the optical benefit)\r\nSubject to following Sub Limits:\r\nAED 300/- per pair per single vision lenses\r\nAED 400/- per pair per bifocal or tri-focal vision lenses\r\nAED 500/- per pair of contact lenses\r\nAED 500/- per frame per year",
          "category_name": "Category C",
          "tob_value": "Not Covered"
      },
      {
          "tob_header": "Alternative Medicine\r\nCovers the following: Ayurveda, Chiropractic, Chinese Medicine, and Homeopathy",
          "category_name": "Category C",
          "tob_value": "Limited to AED 3,000 per person per annum\r\n\r\n20% coinsurance payable by the insured per visit. No coinsurance is applicable if a follow-up visit is made within seven days\r\n\r\nThe claims will be settled on reimbursement basis, and only from providers which are recognized and approved by Nextcare as alternative preferred providers - refer to Nextcare website for details"
      },
      {
          "tob_header": "Organ Transplant",
          "category_name": "Category C",
          "tob_value": "Organ transplantation shall cover the organ transplantation as recipient excluding any cost related to donor, and excluding the acquisition and organ cost\r\nOrgans covered are: heart, lung, kidney, pancreas, liver, Allogeneic & autologous bone marrow."
      },
      {
          "tob_header": "New Born Cover",
          "category_name": "Category C",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions defined by DHA."
      },
      {
          "tob_header": "Medical Advice Service “See A Doctor” (UAE)",
          "category_name": "Category C",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a qualified doctor, for general medical advice and instructions for self-care or recommendations on medications. For users calling from the UAE only, the physician can issue a prescription for the recommended medications. The service can only be accessed during the validity period of the policy coverage."
      },
      {
          "tob_header": "Return Airfare Ticket \r\nfor In-Patient treatment at home country",
          "category_name": "Category C",
          "tob_value": "This benefit can be covered subject to the following guidelines:\r\n\r\n - Cost of In-Patient treatment at home country is 50% or less compared to the cost of the same treatment and applicable network charges in UAE\r\n - Covered only for the patient (i.e. excluding accompanying persons)\r\n - Only on reimbursement basis, and subject to pre-approval\r\n - Covered up to a maximum of AED 3,000 for the round trip ticket"
      },
      {
          "tob_header": "Wellness Benefit",
          "category_name": "Category C",
          "tob_value": "Coverage for an Annual Health Check-up Package with NEXtCARE partner providers, subject to a 20% coinsurance and the following annual limits (as per the member's Medical Out-Patient Network): \r\n\r\nGN+ :   AED 1,500\r\nGN :   AED 1,000\r\nGN Excluding Mediclinic, Al Zahra & HMG and RN :  AED 500\r\nRN2 :   Not Covered\r\nRN3 :   Not Covered\r\n\r\nMember to check with NEXtCARE the latest list of approved packages. Coverage on Reimbursement basis only."
      },
      {
          "tob_header": "Home Nursing Hospitalization",
          "category_name": "Category D",
          "tob_value": "Covered up to Maximum AED 7,500 per person per annum"
      },
      {
          "tob_header": "Emergency road ambulance services to and from hospital by registered ambulance services provider",
          "category_name": "Category D",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Cash Indemnity for In-Patient Treatment post hospitlization up to max of 15 days, subject to providing discharge summary or proof of hospitalization",
          "category_name": "Category D",
          "tob_value": "AED 200 per night\r\nApplicable to all inpatient hospitalizations that are not submitted to the Insurance Company"
      },
      {
          "tob_header": "Essential vaccinations and inoculations for newborns and children as stipulated in the DHA’s policies and its updates (currently the same as Federal MOH)",
          "category_name": "Category D",
          "tob_value": "Inside Network: 100% Actual Cost\r\nOutside Network : UCR Basis "
      },
      {
          "tob_header": "Physiotherapy ( Subject to pre-approval) ",
          "category_name": "Category D",
          "tob_value": "15 sessions per member per annum"
      },
      {
          "tob_header": "Preventive services, vaccines and immunizations",
          "category_name": "Category D",
          "tob_value": "Frequency restricted to:\r\nDiabetes: Every 3 years from age 30\r\nHigh risk individuals annually from age 18"
      },
      {
          "tob_header": "Diagnostic and treatment services for dental and gum treatments( Emergency cases Only) \r\nDental emergency is any injury to your teeth or gums that can put you at a risk of permanent damage, such as Chipped or broken teeth, Knocked-out tooth ,Soft-tissue injuries and etc",
          "category_name": "Category D",
          "tob_value": "Covered "
      },
      {
          "tob_header": "Hearing and vision aids, and vision correction by surgeries and laser ( Emergency cases Only)\r\nHearing Emergencies include Object/insect in the ear , ruptued eardrum ,  sudden hearing loss and etc\r\nVision Emergencies include  bleeding or discharge from or around the eye, double vision and Loss of vision, total or partial, one eye or both etc.",
          "category_name": "Category D",
          "tob_value": "Covered "
      },
      {
          "tob_header": "Kidney Dialysis Treatment\r\nCoverage for hemodialysis or peritoneal dialysis",
          "category_name": "Category D",
          "tob_value": "Covered up to Maximum AED 25,000 per person per annum"
      },
      {
          "tob_header": "Healthcare services for work illnesses and injuries as per Federal Law No.8 of 1980 concerning the Regulation of Work Relations, as amended, and applicable laws in this respect",
          "category_name": "Category D",
          "tob_value": "Covered up to Maximum AED 10,000 per person per annum"
      },
      {
          "tob_header": "Adult Pneumococcal Conjugate Vaccine",
          "category_name": "Category D",
          "tob_value": "Covered as per DHA Adult Pneumococcal Vaccination guidelines"
      },
      {
          "tob_header": "Cancer Treatment\r\n Screening, Healthcare Services, Investigations and Treatments only for members enrolled under Patient Support Program only",
          "category_name": "Category D",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
      },
      {
          "tob_header": "Hepatitis B & C Virus Screening and Treatment\r\n Screening, Healthcare Services, Investigations and Treatments only for members enrolled under Patient Support Program only",
          "category_name": "Category D",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
      },
      {
          "tob_header": "Influenza Vaccine",
          "category_name": "Category D",
          "tob_value": "Covered once per Annum"
      },
      {
          "tob_header": "Psychiatric and Mental Health",
          "category_name": "Category D",
          "tob_value": "In-Patient, Out-Patient, and Emergency cover up to a maximum of AED 10,000/- per person per annum.\r\n\r\n20% coinsurance payable by the insured per visit for Out-Patient services.\r\nNo coinsurance is applicable if a follow-up vist is made within seven days"
      },
      {
          "tob_header": "Repatriation of Mortal Remains to the Country of Domicile:",
          "category_name": "Category D",
          "tob_value": "Covered up to Maximum AED 15,000 per person per annum settled on Reimbursement basis with no co-pay"
      },
      {
          "tob_header": "Second Medical Opinion",
          "category_name": "Category D",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to world renowned  providers to re-evaluate their earlier diagnosis, medical history and treatment plan for non-emergency cases.\r\nCardholder is entitled to use the Second Medical Opinion service two times within the 12 months Policy validity period. "
      },
      {
          "tob_header": "Symptom Checker",
          "category_name": "Category D",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a tool that uses artificial intelligence algorithms to anonymously analyze the member’s symptoms and medical history to suggest the most probable diagnosis and route of care. "
      },
      {
          "tob_header": "Dental benefit\r\n(Enhanced coverage is subject to additional premium)\r\nCovers the following: Consultation & X-Ray, Scaling & Polishing, Tooth Extraction, Amalgam fillings, Temporary and/or permanent composite, fillings and root canal treatment only.",
          "category_name": "Category D",
          "tob_value": "Limited to AED 500/- subject to 30% Co-pay\r\nIn-Network: Direct Billing\r\nOut of Network: Reimbursement "
      },
      {
          "tob_header": "Optical benefit (Subject to Additonal Premium) covers the following:  Optical examinations conducted for the purpose of obtaining eye glasses or lenses, Consultation by an ophthalmologist, Sight testing, Medication (included within the optical benefit)\r\nSubject to following Sub Limits:\r\nAED 300/- per pair per single vision lenses\r\nAED 400/- per pair per bifocal or tri-focal vision lenses\r\nAED 500/- per pair of contact lenses\r\nAED 500/- per frame per year",
          "category_name": "Category D",
          "tob_value": "Not Covered"
      },
      {
          "tob_header": "Alternative Medicine\r\nCovers the following: Ayurveda, Chiropractic, Chinese Medicine, and Homeopathy",
          "category_name": "Category D",
          "tob_value": "Limited to AED 2,500 per person per annum\r\n\r\n20% coinsurance payable by the insured per visit. No coinsurance is applicable if a follow-up visit is made within seven days\r\n\r\nThe claims will be settled on reimbursement basis, and only from providers which are recognized and approved by Nextcare as alternative preferred providers - refer to Nextcare website for details"
      },
      {
          "tob_header": "Organ Transplant",
          "category_name": "Category D",
          "tob_value": "Organ transplantation shall cover the organ transplantation as recipient excluding any cost related to donor, and excluding the acquisition and organ cost\r\nOrgans covered are: heart, lung, kidney, pancreas, liver, Allogeneic & autologous bone marrow."
      },
      {
          "tob_header": "New Born Cover",
          "category_name": "Category D",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions defined by DHA."
      },
      {
          "tob_header": "Medical Advice Service “See A Doctor” (UAE)",
          "category_name": "Category D",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a qualified doctor, for general medical advice and instructions for self-care or recommendations on medications. For users calling from the UAE only, the physician can issue a prescription for the recommended medications. The service can only be accessed during the validity period of the policy coverage."
      },
      {
          "tob_header": "Return Airfare Ticket \r\nfor In-Patient treatment at home country",
          "category_name": "Category D",
          "tob_value": "This benefit can be covered subject to the following guidelines:\r\n\r\n - Cost of In-Patient treatment at home country is 50% or less compared to the cost of the same treatment and applicable network charges in UAE\r\n - Covered only for the patient (i.e. excluding accompanying persons)\r\n - Only on reimbursement basis, and subject to pre-approval\r\n - Covered up to a maximum of AED 3,000 for the round trip ticket"
      },
      {
          "tob_header": "Wellness Benefit",
          "category_name": "Category D",
          "tob_value": "Coverage for an Annual Health Check-up Package with NEXtCARE partner providers, subject to a 20% coinsurance and the following annual limits (as per the member's Medical Out-Patient Network): \r\n\r\nGN+ :   AED 1,500\r\nGN :   AED 1,000\r\nGN Excluding Mediclinic, Al Zahra & HMG and RN :  AED 500\r\nRN2 :   Not Covered\r\nRN3 :   Not Covered\r\n\r\nMember to check with NEXtCARE the latest list of approved packages. Coverage on Reimbursement basis only."
      },
      {
          "tob_header": "Home Nursing Hospitalization",
          "category_name": "Category E",
          "tob_value": "Covered up to Maximum AED 10,000 per person per annum"
      },
      {
          "tob_header": "Emergency road ambulance services to and from hospital by registered ambulance services provider",
          "category_name": "Category E",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Cash Indemnity for In-Patient Treatment post hospitlization up to max of 15 days, subject to providing discharge summary or proof of hospitalization",
          "category_name": "Category E",
          "tob_value": "AED 200 per night\r\nApplicable to all inpatient hospitalizations that are not submitted to the Insurance Company"
      },
      {
          "tob_header": "Vaccination for Children ( as per MOH, UAE)",
          "category_name": "Category E",
          "tob_value": "Inside Network: 100% Actual Cost\r\nOutside Network : UCR Basis "
      },
      {
          "tob_header": "Physiotherapy ( Subject to pre-approval) ",
          "category_name": "Category E",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Diagnostic and treatment services for dental and gum treatments, Hearing and vision aids, and vision correction by surgeries and laser (Emergency cases Only)\r\nDental emergency is any injury to your teeth or gums that can put you at a risk of permanent damage, such as Chipped or broken teeth, Knocked-out tooth ,Soft-tissue injuries and etc\r\nHearing Emergencies include Object/insect in the ear , ruptued eardrum ,  sudden hearing loss and etc\r\nVision Emergencies include  bleeding or discharge from or around the eye, double vision and Loss of vision, total or partial, one eye or both etc.",
          "category_name": "Category E",
          "tob_value": "Covered "
      },
      {
          "tob_header": "Kidney Dialysis Treatment\r\nCoverage for hemodialysis or peritoneal dialysis",
          "category_name": "Category E",
          "tob_value": "Covered up to Maximum AED 35,000 per person per annum"
      },
      {
          "tob_header": "Healthcare services for work illnesses and injuries as per Federal Law No.8 of 1980 concerning the Regulation of Work Relations, as amended, and applicable laws in this respect",
          "category_name": "Category E",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Transient mental disorder or acute reaction to stress",
          "category_name": "Category E",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Repatriation of Mortal Remains to the Country of Domicile:",
          "category_name": "Category E",
          "tob_value": "Covered up to Maximum AED 20,000 per person per annum"
      },
      {
          "tob_header": "Second Medical Opinion",
          "category_name": "Category E",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to world renowned  providers to re-evaluate their earlier diagnosis, medical history and treatment plan for non-emergency cases.\r\nCardholder is entitled to use the Second Medical Opinion service two times within the 12 months Policy validity period."
      },
      {
          "tob_header": "Symptom Checker",
          "category_name": "Category E",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a tool that uses artificial intelligence algorithms to anonymously analyze the member’s symptoms and medical history to suggest the most probable diagnosis and route of care."
      },
      {
          "tob_header": "Dental benefit ( subject to additional premium)\r\nCovers the following: Consultation & X-Ray, Scaling & Polishing, Tooth Extraction, Amalgam fillings, Temporary and/or permanent composite, fillings and root canal treatment only.",
          "category_name": "Category E",
          "tob_value": "Not Covered"
      },
      {
          "tob_header": "Optical benefit ( subject to additional premium)\r\nCovers the following:  Optical examinations conducted for the purpose of obtaining eye glasses or  lenses, Consultation by an ophthalmologist, Sight testing, Medication (included within the optical benefit)                                                                                       \r\n           \r\nSubject to following Sub Limits :\r\nAED 300/- per pair per single vision lenses.\r\nAED 400/- per pair per bifocal or tri-focal vision lenses.\r\nAED 500/- per pair of contact lenses\r\nAED 500/- per frame per year",
          "category_name": "Category E",
          "tob_value": "Not Covered"
      },
      {
          "tob_header": "Alternative Medicine\r\nCovers the following: Ayurveda, Chiropractic, Chinese Medicine, and Homeopathy",
          "category_name": "Category E",
          "tob_value": "Limited to AED 2,000 per person per annum\r\n\r\n20% coinsurance payable by the insured per visit. No coinsurance is applicable if a follow-up visit is made within seven days\r\n\r\nThe claims will be settled on reimbursement basis, and only from providers which are recognized and approved by Nextcare as alternative preferred providers - refer to Nextcare website for details"
      },
      {
          "tob_header": "Organ Transplant",
          "category_name": "Category E",
          "tob_value": "Organ transplantation shall cover the organ transplantation as recipient excluding any cost related to donor, and excluding the acquisition and organ cost\r\nOrgans covered are: heart, lung, kidney, pancreas, liver, Allogeneic & autologous bone marrow."
      },
      {
          "tob_header": "Medical Advice Service “See A Doctor” (UAE)",
          "category_name": "Category E",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a highly qualified doctor, for general medical advice and instructions for self-care or recommendations on medications. For users calling from the UAE only, the physician can issue a prescription for the recommended medications. The service can only be accessed during the validity period of the policy coverage."
      },
      {
          "tob_header": "Return Airfare Ticket \r\nfor In-Patient treatment at home country",
          "category_name": "Category E",
          "tob_value": "This benefit can be covered subject to the following guidelines:\r\n \r\n - Cost of In-Patient treatment at home country is 50% or less compared to the cost of the same treatment and applicable network charges in UAE\r\n - Covered only for the patient (i.e. excluding accompanying persons)\r\n - Only on reimbursement basis, and subject to pre-approval\r\n - Covered up to a maximum of AED 3,000 for the round trip ticket"
      },
      {
          "tob_header": "Wellness Benefit",
          "category_name": "Category E",
          "tob_value": "Coverage for an Annual Health Check-up Package with NEXtCARE partner providers, subject to a 20% coinsurance and the following annual limits (as per the member's Medical Out-Patient Network): \r\n\r\nGN+ : AED 1,500\r\nGN : AED 1,000\r\nRN : AED 500\r\nRN2 : Not Covered\r\nRN3 : Not Covered\r\n\r\nMember to check with NEXtCARE the latest list of approved packages. Coverage on Reimbursement basis only."
      },
      {
          "tob_header": "Home Nursing Hospitalization",
          "category_name": "Category F",
          "tob_value": "Covered up to Maximum AED 7,500 per person per annum"
      },
      {
          "tob_header": "Emergency road ambulance services to and from hospital by registered ambulance services provider",
          "category_name": "Category F",
          "tob_value": "Covered"
      },
      {
          "tob_header": "Cash Indemnity for In-Patient Treatment post hospitlization up to max of 15 days, subject to providing discharge summary or proof of hospitalization",
          "category_name": "Category F",
          "tob_value": "AED 150 per night\r\nApplicable to all inpatient hospitalizations that are not submitted to the Insurance Company"
      },
      {
          "tob_header": "Essential vaccinations and inoculations for newborns and children as stipulated in the DHA’s policies and its updates (currently the same as Federal MOH)",
          "category_name": "Category F",
          "tob_value": "Inside Network: 100% Actual Cost\r\nOutside Network : UCR Basis "
      },
      {
          "tob_header": "Physiotherapy ( Subject to pre-approval) ",
          "category_name": "Category F",
          "tob_value": "10 sessions per member per annum"
      },
      {
          "tob_header": "Preventive services, vaccines and immunizations",
          "category_name": "Category F",
          "tob_value": "Frequency restricted to:\r\nDiabetes: Every 3 years from age 30\r\nHigh risk individuals annually from age 18"
      },
      {
          "tob_header": "Diagnostic and treatment services for dental and gum treatments( Emergency cases Only) \r\nDental emergency is any injury to your teeth or gums that can put you at a risk of permanent damage, such as Chipped or broken teeth, Knocked-out tooth ,Soft-tissue injuries and etc",
          "category_name": "Category F",
          "tob_value": "Covered "
      },
      {
          "tob_header": "Hearing and vision aids, and vision correction by surgeries and laser ( Emergency cases Only)\r\nHearing Emergencies include Object/insect in the ear , ruptued eardrum ,  sudden hearing loss and etc\r\nVision Emergencies include  bleeding or discharge from or around the eye, double vision and Loss of vision, total or partial, one eye or both etc.",
          "category_name": "Category F",
          "tob_value": "Covered "
      },
      {
          "tob_header": "Kidney Dialysis Treatment\r\nCoverage for hemodialysis or peritoneal dialysis",
          "category_name": "Category F",
          "tob_value": "Covered up to Maximum AED 20,000 per person per annum"
      },
      {
          "tob_header": "Healthcare services for work illnesses and injuries as per Federal Law No.8 of 1980 concerning the Regulation of Work Relations, as amended, and applicable laws in this respect",
          "category_name": "Category F",
          "tob_value": "Covered up to Maximum AED 10,000 per person per annum"
      },
      {
          "tob_header": "Adult Pneumococcal Conjugate Vaccine",
          "category_name": "Category F",
          "tob_value": "Covered as per DHA Adult Pneumococcal Vaccination guidelines"
      },
      {
          "tob_header": "Cancer Treatment\r\n Screening, Healthcare Services, Investigations and Treatments only for members enrolled under Patient Support Program only",
          "category_name": "Category F",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
      },
      {
          "tob_header": "Hepatitis B & C Virus Screening and Treatment\r\n Screening, Healthcare Services, Investigations and Treatments only for members enrolled under Patient Support Program only",
          "category_name": "Category F",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
      },
      {
          "tob_header": "Influenza Vaccine",
          "category_name": "Category F",
          "tob_value": "Covered once per Annum"
      },
      {
          "tob_header": "Psychiatric and Mental Health",
          "category_name": "Category F",
          "tob_value": "In-Patient, Out-Patient, and Emergency cover up to a maximum of AED 10,000/- per person per annum.\r\n\r\n20% coinsurance payable by the insured per visit for Out-Patient services.\r\nNo coinsurance is applicable if a follow-up vist is made within seven days"
      },
      {
          "tob_header": "Repatriation of Mortal Remains to the Country of Domicile:",
          "category_name": "Category F",
          "tob_value": "Covered up to Maximum AED 10,000 per person per annum settled on Reimbursement basis with no co-pay"
      },
      {
          "tob_header": "Second Medical Opinion",
          "category_name": "Category F",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to world renowned  providers to re-evaluate their earlier diagnosis, medical history and treatment plan for non-emergency cases.\r\nCardholder is entitled to use the Second Medical Opinion service two times within the 12 months Policy validity period. "
      },
      {
          "tob_header": "Symptom Checker",
          "category_name": "Category F",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a tool that uses artificial intelligence algorithms to anonymously analyze the member’s symptoms and medical history to suggest the most probable diagnosis and route of care. "
      },
      {
          "tob_header": "Dental benefit (Subject to Additonal Premium)\r\nCovers the following: Consultation & X-Ray, Scaling & Polishing, Tooth Extraction, Amalgam fillings, Temporary and/or permanent composite, fillings and root canal treatment only.",
          "category_name": "Category F",
          "tob_value": "Not Covered"
      },
      {
          "tob_header": "Optical benefit (Subject to Additonal Premium) covers the following:  Optical examinations conducted for the purpose of obtaining eye glasses or lenses, Consultation by an ophthalmologist, Sight testing, Medication (included within the optical benefit)\r\nSubject to following Sub Limits:\r\nAED 300/- per pair per single vision lenses\r\nAED 400/- per pair per bifocal or tri-focal vision lenses\r\nAED 500/- per pair of contact lenses\r\nAED 500/- per frame per year",
          "category_name": "Category F",
          "tob_value": "Not Covered"
      },
      {
          "tob_header": "Alternative Medicine\r\nCovers the following: Ayurveda, Chiropractic, Chinese Medicine, and Homeopathy",
          "category_name": "Category F",
          "tob_value": "Limited to AED 2,500 per person per annum\r\n\r\n20% coinsurance payable by the insured per visit. No coinsurance is applicable if a follow-up visit is made within seven days\r\n\r\nThe claims will be settled on reimbursement basis, and only from providers which are recognized and approved by Nextcare as alternative preferred providers - refer to Nextcare website for details"
      },
      {
          "tob_header": "Organ Transplant",
          "category_name": "Category F",
          "tob_value": "Organ transplantation shall cover the organ transplantation as recipient excluding any cost related to donor, and excluding the acquisition and organ cost\r\nOrgans covered are: heart, lung, kidney, pancreas, liver, Allogeneic & autologous bone marrow."
      },
      {
          "tob_header": "New Born Cover",
          "category_name": "Category F",
          "tob_value": "Covered as per the Terms,Conditions and Exclusions defined by DHA."
      },
      {
          "tob_header": "Medical Advice Service “See A Doctor” (UAE)",
          "category_name": "Category F",
          "tob_value": "This benefit gives members access through NEXtCARE mobile application to a qualified doctor, for general medical advice and instructions for self-care or recommendations on medications. For users calling from the UAE only, the physician can issue a prescription for the recommended medications. The service can only be accessed during the validity period of the policy coverage."
      },
      {
          "tob_header": "Return Airfare Ticket \r\nfor In-Patient treatment at home country",
          "category_name": "Category F",
          "tob_value": "This benefit can be covered subject to the following guidelines:\r\n\r\n - Cost of In-Patient treatment at home country is 50% or less compared to the cost of the same treatment and applicable network charges in UAE\r\n - Covered only for the patient (i.e. excluding accompanying persons)\r\n - Only on reimbursement basis, and subject to pre-approval\r\n - Covered up to a maximum of AED 3,000 for the round trip ticket"
      },
      {
          "tob_header": "Wellness Benefit",
          "category_name": "Category F",
          "tob_value": "Coverage for an Annual Health Check-up Package with NEXtCARE partner providers, subject to a 20% coinsurance and the following annual limits (as per the member's Medical Out-Patient Network): \r\n\r\nGN+ :   AED 1,500\r\nGN :   AED 1,000\r\nGN Excluding Mediclinic, Al Zahra & HMG and RN :  AED 500\r\nRN2 :   Not Covered\r\nRN3 :   Not Covered\r\n\r\nMember to check with NEXtCARE the latest list of approved packages. Coverage on Reimbursement basis only."
      }
  ],
  "BASIS OF CLAIMS SETTLEMENT": [
      {
          "tob_header": "Claims Settlement In-Patient:\r\n1. UAE within the Network- Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network / With or without prior approval of the ceding company - Reimbursement basis only\r\n\r\nClaims Settlement Out-Patient:\r\n1. UAE within the Network - Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network - Reimbursement basis only\r\nReimbursement in Emergency Cases:\r\n(emergency treatment must be notified within 24 hours if treatment was received within UAE)\r\n\r\nEligible Treatment\r\nUAE\r\nInside Territorial Scope\r\nOutside Territorial Scope",
          "category_name": "Category A",
          "tob_value": "100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% of incurred costs\r\n100% of incurred costs\r\n100% of incurred cost"
      },
      {
          "tob_header": "Claims Settlement In-Patient:\r\n1. UAE within the Network- Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network / With or without prior approval of the ceding company - Reimbursement basis only\r\n\r\nClaims Settlement Out-Patient:\r\n1. UAE within the Network - Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network - Reimbursement basis only\r\n\r\nReimbursement in Emergency Cases:\r\n(emergency treatment must be notified within 24 hours if treatment was received within UAE)\r\n\r\nEligible Treatment\r\nUAE\r\nInside Territorial Scope\r\nOutside Territorial Scope",
          "category_name": "Category B",
          "tob_value": "100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% of incurred costs\r\n100% of incurred costs\r\n100% of incurred costs"
      },
      {
          "tob_header": "Claims Settlement In-Patient:\r\n1. UAE within the Network- Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network / With or without prior approval of the ceding company - Reimbursement basis only\r\n\r\nClaims Settlement Out-Patient:\r\n1. UAE within the Network - Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network - Reimbursement basis only\r\nReimbursement in Emergency Cases:\r\n(emergency treatment must be notified within 24 hours if treatment was received within UAE)\r\n\r\nEligible Treatment\r\nUAE\r\nInside Territorial Scope\r\nOutside Territorial Scope",
          "category_name": "Category C",
          "tob_value": "100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% of incurred costs\r\n100% of incurred costs\r\n100% of incurred cost"
      },
      {
          "tob_header": "Claims Settlement In-Patient:\r\n1. UAE within the Network- Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network / With or without prior approval of the ceding company - Reimbursement basis only\r\n\r\nClaims Settlement Out-Patient:\r\n1. UAE within the Network - Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network - Reimbursement basis only\r\nReimbursement in Emergency Cases:\r\n(emergency treatment must be notified within 24 hours if treatment was received within UAE)\r\n\r\nEligible Treatment\r\nUAE\r\nInside Territorial Scope\r\nOutside Territorial Scope",
          "category_name": "Category D",
          "tob_value": "100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% of incurred costs\r\n100% of incurred costs\r\n100% of incurred cost"
      },
      {
          "tob_header": "Claims Settlement In-Patient:\r\n1. UAE within the Network- Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network / With or without prior approval of the ceding company - Reimbursement basis only\r\n\r\nClaims Settlement Out-Patient:\r\n1. UAE within the Network - Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network - Reimbursement basis only\r\n\r\nReimbursement in Emergency Cases:\r\n(emergency treatment must be notified within 24 hours if treatment was received within UAE)\r\n\r\nEligible Treatment\r\nUAE\r\nInside Territorial Scope\r\nOutside Territorial Scope",
          "category_name": "Category E",
          "tob_value": "100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% of incurred costs\r\n100% of incurred costs\r\n100% of incurred costs"
      },
      {
          "tob_header": "Claims Settlement In-Patient:\r\n1. UAE within the Network- Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network / With or without prior approval of the ceding company - Reimbursement basis only\r\n\r\nClaims Settlement Out-Patient:\r\n1. UAE within the Network - Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network - Reimbursement basis only\r\nReimbursement in Emergency Cases:\r\n(emergency treatment must be notified within 24 hours if treatment was received within UAE)\r\n\r\nEligible Treatment\r\nUAE\r\nInside Territorial Scope\r\nOutside Territorial Scope",
          "category_name": "Category F",
          "tob_value": "100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% of incurred costs\r\n100% of incurred costs\r\n100% of incurred cost"
      }
  ],
  "Maternity Benefits                        ": [
      {
          "tob_header": "Maternity Benefits                        ",
          "category_name": "Category A",
          "tob_value": "Subject to coinsurance and sub-limits"
      },
      {
          "tob_header": "In-patient Maternity services      ",
          "category_name": "Category A",
          "tob_value": "In-patient maternity services:  \r\n10% coinsurance payable by the insured, Maximum benefit (4 options)\r\nDefault for GN+: 20,000 AED per delivery\r\nOption 1: GN - 15,000 AED per delivery\r\nOption 2: GN Excluding Mediclinic, Al Zahra & HMG - 13,500 AED per delivery                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Option 3: RN - 12,500 AED per delivery\r\nOption 4: RN2 and RN3 - 10,000 AED per delivery\r\n\r\n(All limits include coinsurance)\r\n\r\nIn-patient maternity services\r\nRequires prior approval from the insurance company or within 24 hours of emergency treatment\r\n10% coinsurance payable by the insured"
      },
      {
          "tob_header": "Out-patient Maternity services      ",
          "category_name": "Category A",
          "tob_value": "Out-patient maternity services: \r\n10% coinsurance payable by the insured\r\nmaximum 8 visits are allowed (as per applicable network);\r\nInitial investigations to include:\r\n- FBC and Platelets\r\n- Blood group, Rhesus status and antibodies\r\n- VDRL\r\n- MSU & urinalysis\r\n- Rubella serology\r\n- HIV\r\n- Hep C offered to high risk patients\r\n- GTT if high risk\r\n- FBS , random s or A1c for all due to high prevalence of diabetes in UAE\r\nVisits to include reviews, checks and tests in accordance with DHA Antenatal Care Protocols\r\n3 ante-natal ultrasound scans"
      },
      {
          "tob_header": "Maternity Benefits                        ",
          "category_name": "Category B",
          "tob_value": "Subject to conditions"
      },
      {
          "tob_header": "In-patient Maternity services      ",
          "category_name": "Category B",
          "tob_value": "Inside Abu Dhabi & Al Ain: Covered up to the Annual Limit of the policy ( In-Patient & Out-Patient)                                                                                                                Delivery inside Abu Dhabi & Al Ain is subject to a deductible of AED 500/- as per HAAD law\r\nOutside Abu Dhabi & Al Ain: Normal Delivery is covered up to AED 10,000/-, C-Section and maternity complications are covered up to AED  12,000/-, Medical Emergency related to Maternity  is covered up to AED 150,000/-"
      },
      {
          "tob_header": "Out-patient Maternity services      ",
          "category_name": "Category B",
          "tob_value": "Covered up to the Annual Limit of the policy subject to the same deductible in the selected plan on consultation"
      },
      {
          "tob_header": "Maternity Benefits                        ",
          "category_name": "Category C",
          "tob_value": "Subject to coinsurance and sub-limits"
      },
      {
          "tob_header": "In-patient Maternity services      ",
          "category_name": "Category C",
          "tob_value": "In-patient maternity services:  \r\n10% coinsurance payable by the insured, Maximum benefit (4 options)\r\nDefault for GN+: 20,000 AED per delivery\r\nOption 1: GN - 15,000 AED per delivery\r\nOption 2: GN Excluding Mediclinic, Al Zahra & HMG - 13,500 AED per delivery                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Option 3: RN - 12,500 AED per delivery\r\nOption 4: RN2 and RN3 - 10,000 AED per delivery\r\n\r\n(All limits include coinsurance)\r\n\r\nIn-patient maternity services\r\nRequires prior approval from the insurance company or within 24 hours of emergency treatment\r\n10% coinsurance payable by the insured"
      },
      {
          "tob_header": "Out-patient Maternity services      ",
          "category_name": "Category C",
          "tob_value": "Out-patient maternity services: \r\n10% coinsurance payable by the insured\r\nmaximum 8 visits are allowed (as per applicable network);\r\nInitial investigations to include:\r\n- FBC and Platelets\r\n- Blood group, Rhesus status and antibodies\r\n- VDRL\r\n- MSU & urinalysis\r\n- Rubella serology\r\n- HIV\r\n- Hep C offered to high risk patients\r\n- GTT if high risk\r\n- FBS , random s or A1c for all due to high prevalence of diabetes in UAE\r\nVisits to include reviews, checks and tests in accordance with DHA Antenatal Care Protocols\r\n3 ante-natal ultrasound scans"
      },
      {
          "tob_header": "Maternity Benefits                        ",
          "category_name": "Category D",
          "tob_value": "Subject to coinsurance and sub-limits"
      },
      {
          "tob_header": "In-patient Maternity services      ",
          "category_name": "Category D",
          "tob_value": "In-patient maternity services:  \r\n10% coinsurance payable by the insured, Maximum benefit (4 options)\r\nDefault for GN+: 20,000 AED per delivery\r\nOption 1: GN - 15,000 AED per delivery\r\nOption 2: GN Excluding Mediclinic, Al Zahra & HMG - 13,500 AED per delivery                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Option 3: RN - 12,500 AED per delivery\r\nOption 4: RN2 and RN3 - 10,000 AED per delivery\r\n\r\n(All limits include coinsurance)\r\n\r\nIn-patient maternity services\r\nRequires prior approval from the insurance company or within 24 hours of emergency treatment\r\n10% coinsurance payable by the insured"
      },
      {
          "tob_header": "Out-patient Maternity services      ",
          "category_name": "Category D",
          "tob_value": "Out-patient maternity services: \r\n10% coinsurance payable by the insured\r\nmaximum 8 visits are allowed (as per applicable network);\r\nInitial investigations to include:\r\n- FBC and Platelets\r\n- Blood group, Rhesus status and antibodies\r\n- VDRL\r\n- MSU & urinalysis\r\n- Rubella serology\r\n- HIV\r\n- Hep C offered to high risk patients\r\n- GTT if high risk\r\n- FBS , random s or A1c for all due to high prevalence of diabetes in UAE\r\nVisits to include reviews, checks and tests in accordance with DHA Antenatal Care Protocols\r\n3 ante-natal ultrasound scans"
      },
      {
          "tob_header": "Maternity Benefits                        ",
          "category_name": "Category E",
          "tob_value": "Subject to conditions"
      },
      {
          "tob_header": "In-patient Maternity services      ",
          "category_name": "Category E",
          "tob_value": "Inside Abu Dhabi & Al Ain: Covered up to the Annual Limit of the policy ( In-Patient & Out-Patient)                                                                                                                Delivery inside Abu Dhabi & Al Ain is subject to a deductible of AED 500/- as per HAAD law\r\nOutside Abu Dhabi & Al Ain: Normal Delivery is covered up to AED 10,000/-, C-Section and maternity complications are covered up to AED  12,000/-, Medical Emergency related to Maternity  is covered up to AED 150,000/-"
      },
      {
          "tob_header": "Out-patient Maternity services      ",
          "category_name": "Category E",
          "tob_value": "Covered up to the Annual Limit of the policy subject to the same deductible in the selected plan on consultation"
      },
      {
          "tob_header": "Maternity Benefits                        ",
          "category_name": "Category F",
          "tob_value": "Subject to coinsurance and sub-limits"
      },
      {
          "tob_header": "In-patient Maternity services      ",
          "category_name": "Category F",
          "tob_value": "In-patient maternity services:  \r\n10% coinsurance payable by the insured, Maximum benefit (4 options)\r\nDefault for GN+: 20,000 AED per delivery\r\nOption 1: GN - 15,000 AED per delivery\r\nOption 2: GN Excluding Mediclinic, Al Zahra & HMG - 13,500 AED per delivery                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Option 3: RN - 12,500 AED per delivery\r\nOption 4: RN2 and RN3 - 10,000 AED per delivery\r\n\r\n(All limits include coinsurance)\r\n\r\nIn-patient maternity services\r\nRequires prior approval from the insurance company or within 24 hours of emergency treatment\r\n10% coinsurance payable by the insured"
      },
      {
          "tob_header": "Out-patient Maternity services      ",
          "category_name": "Category F",
          "tob_value": "Out-patient maternity services: \r\n10% coinsurance payable by the insured\r\nmaximum 8 visits are allowed (as per applicable network);\r\nInitial investigations to include:\r\n- FBC and Platelets\r\n- Blood group, Rhesus status and antibodies\r\n- VDRL\r\n- MSU & urinalysis\r\n- Rubella serology\r\n- HIV\r\n- Hep C offered to high risk patients\r\n- GTT if high risk\r\n- FBS , random s or A1c for all due to high prevalence of diabetes in UAE\r\nVisits to include reviews, checks and tests in accordance with DHA Antenatal Care Protocols\r\n3 ante-natal ultrasound scans"
      }
  ]
}