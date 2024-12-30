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
  census:{}[]
}

// {
//   text: "S.No",
//   alignment: "center",
//   bold: true,
//   style: "header",
//   fillColor: "#32CD32",
// },