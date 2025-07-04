import type { Submission } from "@/components/submission-list"

export const mockSubmissions: Submission[] = [
  {
    id: "1",
    reference: "SUB-2023-001",
    client: "GreenTech Solutions Ltd.",
    broker: "ABC Insurance Brokers",
    submissionDate: "24 April 2025",
    stage: "extraction",
    status: "needs-info",
    lineOfBusiness: "Property",
    location: "55 Tech Drive, London, EC1A 1BB",
    propertyType: "Commercial Office Building",
    coverageAmount: "£2,000,000",
  },
  {
    id: "2",
    reference: "SUB-2023-002",
    client: "Coffee Haven Ltd.",
    broker: "XYZ Insurance Services",
    submissionDate: "24 April 2025",
    stage: "core-data",
    status: "processing",
    lineOfBusiness: "Commercial",
    location: "123 High Street, London, W1D 3QY",
    propertyType: "Coffee Shop and Retail Store",
    coverageAmount: "£1,500,000",
  },
  {
    id: "3",
    reference: "SUB-2023-003",
    client: "Parsian Evin Hotel Ltd.",
    broker: "Prime Insurance Brokers",
    submissionDate: "24 April 2025",
    stage: "enrichment",
    status: "pending",
    lineOfBusiness: "Hospitality",
    location: "No. 45, Evin Street, Tehran, Iran",
    propertyType: "Hotel",
    coverageAmount: "IRR 800,000,000,000",
  },
  {
    id: "4",
    reference: "SUB-2023-004",
    client: "TechStart Inc.",
    broker: "Digital Insurance",
    submissionDate: "23 April 2025",
    stage: "rank",
    status: "approved",
    lineOfBusiness: "Cyber",
    location: "200 Silicon Avenue, London, EC2A 2FA",
    propertyType: "Technology Office",
    coverageAmount: "£3,000,000",
    premium: 25000,
  },
  {
    id: "5",
    reference: "SUB-2023-005",
    client: "Global Logistics",
    broker: "Marine Insurance",
    submissionDate: "22 April 2025",
    stage: "rank",
    status: "rejected",
    lineOfBusiness: "Marine",
    location: "Port of London, E16 1AJ",
    propertyType: "Warehouse and Distribution Center",
    coverageAmount: "£5,000,000",
  },
  {
    id: "6",
    reference: "SUB-2023-006",
    client: "Healthcare Solutions",
    broker: "Medical Insurance Group",
    submissionDate: "21 April 2025",
    stage: "extraction",
    status: "needs-info",
    lineOfBusiness: "Medical Malpractice",
    location: "45 Harley Street, London, W1G 8QR",
    propertyType: "Medical Clinic",
    coverageAmount: "£4,000,000",
  },
  {
    id: "7",
    reference: "SUB-2023-007",
    client: "Global Manufacturing",
    broker: "Industrial Insurance",
    submissionDate: "20 April 2025",
    stage: "core-data",
    status: "duplicate",
    lineOfBusiness: "Property",
    location: "Unit 5, Industrial Estate, Birmingham, B6 7EU",
    propertyType: "Manufacturing Plant",
    coverageAmount: "£7,500,000",
  },
  {
    id: "8",
    reference: "SUB-2023-008",
    client: "Tech Innovations",
    broker: "Digital Insurance",
    submissionDate: "19 April 2025",
    stage: "core-data",
    status: "duplicate",
    lineOfBusiness: "Cyber",
    location: "15 Innovation Way, Cambridge, CB2 1TN",
    propertyType: "Research & Development Facility",
    coverageAmount: "£2,800,000",
  },
  {
    id: "9",
    reference: "SUB-2023-009",
    client: "Retail Solutions",
    broker: "Commercial Insurance",
    submissionDate: "18 April 2025",
    stage: "core-data",
    status: "unique",
    lineOfBusiness: "Liability",
    location: "100 Oxford Street, London, W1D 1LL",
    propertyType: "Retail Store",
    coverageAmount: "£1,200,000",
  },
  {
    id: "10",
    reference: "SUB-2023-010",
    client: "Global Shipping",
    broker: "Marine Insurance",
    submissionDate: "17 April 2025",
    stage: "enrichment",
    status: "non-compliant",
    lineOfBusiness: "Marine",
    location: "Southampton Docks, SO14 3QN",
    propertyType: "Shipping Terminal",
    coverageAmount: "£10,000,000",
  },
]

export const mockPendingActions = [
  {
    id: "1",
    title: "Review Missing Information",
    description: "GreenTech Solutions Ltd. submission is missing business description and claims history",
    priority: "high",
    stage: "Missing Data Check",
  },
  {
    id: "2",
    title: "Verify Compliance Check",
    description: "Manual review required for Parsian Evin Hotel Ltd. compliance check",
    priority: "medium",
    stage: "Compliance Check",
  },
  {
    id: "3",
    title: "Approve Quotation",
    description: "Final approval needed for TechStart Inc. quotation",
    priority: "low",
    stage: "Guideline Check",
  },
]

export const distributionData = [
  { name: "Missing Data Check", value: 12, color: "#3ABFF8" },
  { name: "Data Duplication Check", value: 8, color: "#FBBF24" },
  { name: "Compliance Check", value: 15, color: "#6366F1" },
  { name: "Guideline Check", value: 10, color: "#10B981" },
]
