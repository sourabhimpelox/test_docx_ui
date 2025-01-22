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
}