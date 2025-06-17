-- Insert dummy data for the insurance dashboard
-- This script populates the database with realistic test data

-- Insert main submissions
INSERT INTO submissions (
    id, reference, client, broker, "submissionDate", stage, status, 
    "lineOfBusiness", premium, location, "propertyType", "coverageAmount", "emailContent"
) VALUES 
-- Missing Data Check submissions
(
    '550e8400-e29b-41d4-a716-446655440001',
    'SUB-2024-001',
    'GreenTech Solutions Ltd.',
    'ABC Insurance Brokers',
    '2024-04-24',
    'extraction',
    'needs-info',
    'Property',
    NULL,
    '55 Tech Drive, London, EC1A 1BB',
    'Commercial Office Building',
    '£2,000,000',
    'Dear ABC Insurance Brokers,

We are reviewing the submission for GreenTech Solutions Ltd. (reference: SUB-2024-001) and require some additional information to proceed with the quotation process.

Please provide the following:
1. A detailed description of business operations
2. 5-year claims history
3. Construction type and materials information for the property

Thank you for your assistance.

Best regards,
InsureFlow Team'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'SUB-2024-002',
    'Healthcare Solutions',
    'Medical Insurance Group',
    '2024-04-21',
    'extraction',
    'needs-info',
    'Medical Malpractice',
    NULL,
    '45 Harley Street, London, W1G 8QR',
    'Medical Clinic',
    '£4,000,000',
    'Dear Medical Insurance Group,

We are reviewing the submission for Healthcare Solutions (reference: SUB-2024-002) and require some additional information to proceed with the quotation process.

Please provide the following:
1. Medical staff qualifications and certifications
2. Annual patient volume data

Thank you for your assistance.

Best regards,
InsureFlow Team'
),

-- Data Duplication Check submissions
(
    '550e8400-e29b-41d4-a716-446655440003',
    'SUB-2024-003',
    'Global Manufacturing',
    'Industrial Insurance',
    '2024-04-20',
    'core-data',
    'duplicate',
    'Property',
    NULL,
    'Unit 5, Industrial Estate, Birmingham, B6 7EU',
    'Manufacturing Plant',
    '£7,500,000',
    'Dear Industrial Insurance,

We have identified that the submission for Global Manufacturing (reference: SUB-2024-003) appears to be a duplicate of an existing submission in our system (reference: SUB-2024-001A) submitted by Risk Partners on April 15, 2024.

To avoid processing duplicate submissions, we will be proceeding with the original submission. If you believe this is an error or if there are significant differences between the submissions, please let us know.

Best regards,
InsureFlow Team'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'SUB-2024-004',
    'Tech Innovations',
    'Digital Insurance',
    '2024-04-19',
    'core-data',
    'duplicate',
    'Cyber',
    NULL,
    '15 Innovation Way, Cambridge, CB2 1TN',
    'Research & Development Facility',
    '£2,800,000',
    'Dear Digital Insurance,

We have identified that the submission for Tech Innovations (reference: SUB-2024-004) appears to be a duplicate of an existing submission in our system (reference: SUB-2024-002A) submitted by your firm on April 16, 2024.

To avoid processing duplicate submissions, we will be proceeding with the original submission. If you believe this is an error or if there are significant differences between the submissions, please let us know.

Best regards,
InsureFlow Team'
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'SUB-2024-005',
    'Retail Solutions',
    'Commercial Insurance',
    '2024-04-18',
    'core-data',
    'unique',
    'Liability',
    NULL,
    '100 Oxford Street, London, W1D 1LL',
    'Retail Store',
    '£1,200,000',
    NULL
),

-- Compliance Check submissions
(
    '550e8400-e29b-41d4-a716-446655440006',
    'SUB-2024-006',
    'Parsian Evin Hotel Ltd.',
    'Prime Insurance Brokers',
    '2024-04-24',
    'enrichment',
    'non-compliant',
    'Hospitality',
    NULL,
    'No. 45, Evin Street, Tehran, Iran',
    'Hotel',
    'IRR 800,000,000,000',
    'Dear Prime Insurance Brokers,

We regret to inform you that we are unable to proceed with the submission for Parsian Evin Hotel Ltd. (reference: SUB-2024-006) due to compliance issues.

Our compliance checks have identified that the client appears on the OFAC sanctions list, which prevents us from providing coverage.

If you believe this is an error or if you have additional information that may affect this decision, please contact our compliance team.

Best regards,
InsureFlow Team'
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    'SUB-2024-007',
    'Coffee Haven Ltd.',
    'XYZ Insurance Services',
    '2024-04-24',
    'enrichment',
    'processing',
    'Commercial',
    NULL,
    '123 High Street, London, W1D 3QY',
    'Coffee Shop and Retail Store',
    '£1,500,000',
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440008',
    'SUB-2024-008',
    'Clean Energy Corp',
    'ABC Insurance Brokers',
    '2024-04-24',
    'enrichment',
    'compliant',
    'Property',
    NULL,
    '200 Green Street, Manchester, M1 1AA',
    'Solar Panel Manufacturing',
    '£5,000,000',
    NULL
),

-- Guideline Check submissions
(
    '550e8400-e29b-41d4-a716-446655440009',
    'SUB-2024-009',
    'Office Complex Ltd.',
    'Commercial Insurance',
    '2024-04-23',
    'rank',
    'proceed',
    'Property',
    45000,
    '300 Business Park, Leeds, LS1 1AB',
    'Office Complex',
    '£8,000,000',
    'INTERNAL SUMMARY FOR UNDERWRITING TEAM

Submission Reference: SUB-2024-009
Client: Office Complex Ltd.
Broker: Commercial Insurance
Line of Business: Property

COMPLETED CHECKS SUMMARY:

1. Missing Data Check: PASSED - All required information provided
2. Data Duplication Check: PASSED - No duplicate submissions found
3. Compliance Check: PASSED - All compliance checks passed
4. Guideline Check: PASSED - Meets all underwriting guidelines

This submission has passed all preliminary checks and is ready for premium calculation and final underwriting review.'
),
(
    '550e8400-e29b-41d4-a716-446655440010',
    'SUB-2024-010',
    'Industrial Warehouse',
    'Risk Partners',
    '2024-04-22',
    'rank',
    'survey',
    'Property',
    NULL,
    '500 Industrial Road, Sheffield, S1 1CD',
    'Warehouse and Distribution',
    '£12,000,000',
    'INTERNAL MEMO: SURVEY REQUEST

To: Field Engineering Team
Re: Survey Request for Industrial Warehouse (SUB-2024-010)

We have reviewed the submission for Industrial Warehouse and determined that an on-site survey is required before proceeding with quotation.

Reason for Survey:
- Higher risk pricing factors identified
- Medium hazard classification requires verification

Please arrange for a survey at your earliest convenience.'
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    'SUB-2024-011',
    'Chemical Plant Ltd.',
    'Industrial Insurance',
    '2024-04-21',
    'rank',
    'reject',
    'Property',
    NULL,
    '100 Chemical Way, Liverpool, L1 1EF',
    'Chemical Processing Plant',
    '£25,000,000',
    'Dear Industrial Insurance,

After careful consideration of the submission for Chemical Plant Ltd. (reference: SUB-2024-011), we regret to inform you that we are unable to provide a quotation at this time.

Our evaluation has identified several factors that place this risk outside our current underwriting appetite, including:
- High hazard classification
- Requested limits exceed our capacity
- Several underwriting guidelines not met

We appreciate your consideration of our company and would be happy to review future submissions that align more closely with our underwriting guidelines.

Best regards,
InsureFlow Team'
);

-- Insert missing data items
INSERT INTO missing_data_items ("submissionId", field, description, severity) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Business Description', 'Detailed description of business operations is required', 'high'),
('550e8400-e29b-41d4-a716-446655440001', 'Claims History', '5-year claims history is missing', 'high'),
('550e8400-e29b-41d4-a716-446655440001', 'Building Construction', 'Construction type and materials information is incomplete', 'medium'),
('550e8400-e29b-41d4-a716-446655440002', 'Staff Credentials', 'Medical staff qualifications and certifications are missing', 'high'),
('550e8400-e29b-41d4-a716-446655440002', 'Patient Volume', 'Annual patient volume data is required', 'medium');

-- Insert duplicate information
INSERT INTO duplicate_info (
    "submissionId", "originalSubmissionId", reference, client, "submissionDate", broker, "matchConfidence"
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'SUB-2024-001A',
    'Global Manufacturing',
    '2024-04-15',
    'Risk Partners',
    92
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    'SUB-2024-002A',
    'Tech Innovations',
    '2024-04-16',
    'Digital Insurance',
    88
);

-- Insert compliance checks
INSERT INTO compliance_checks ("submissionId", name, status, details) VALUES
-- Parsian Evin Hotel (non-compliant)
('550e8400-e29b-41d4-a716-446655440006', 'Sanctions List', 'failed', 'Client appears on OFAC sanctions list'),
('550e8400-e29b-41d4-a716-446655440006', 'Companies House', 'passed', 'Company registration verified'),
('550e8400-e29b-41d4-a716-446655440006', 'Dun & Bradstreet', 'passed', 'Financial stability confirmed'),
('550e8400-e29b-41d4-a716-446655440006', 'Geocoding', 'passed', 'Location verified'),

-- Coffee Haven (processing)
('550e8400-e29b-41d4-a716-446655440007', 'Sanctions List', 'passed', 'No sanctions found'),
('550e8400-e29b-41d4-a716-446655440007', 'Companies House', 'passed', 'Company registration verified'),
('550e8400-e29b-41d4-a716-446655440007', 'Dun & Bradstreet', 'pending', NULL),
('550e8400-e29b-41d4-a716-446655440007', 'Geocoding', 'pending', NULL),

-- Clean Energy Corp (compliant)
('550e8400-e29b-41d4-a716-446655440008', 'Sanctions List', 'passed', 'No sanctions found'),
('550e8400-e29b-41d4-a716-446655440008', 'Companies House', 'passed', 'Company registration verified'),
('550e8400-e29b-41d4-a716-446655440008', 'Dun & Bradstreet', 'passed', 'Financial stability confirmed'),
('550e8400-e29b-41d4-a716-446655440008', 'Geocoding', 'passed', 'Location verified');

-- Insert guideline checks
INSERT INTO guideline_checks ("submissionId", name, status, details, score, "maxScore") VALUES
-- Office Complex (proceed)
('550e8400-e29b-41d4-a716-446655440009', 'Underwriting Guidelines', 'passed', 'Meets all underwriting guidelines', 90, 100),
('550e8400-e29b-41d4-a716-446655440009', 'Limits & Deductibles', 'passed', 'Standard limits and deductibles', 85, 100),
('550e8400-e29b-41d4-a716-446655440009', 'Pricing Factors', 'passed', 'Competitive pricing', 80, 100),
('550e8400-e29b-41d4-a716-446655440009', 'Hazard Classification', 'passed', 'Low hazard classification', 85, 100),

-- Industrial Warehouse (survey)
('550e8400-e29b-41d4-a716-446655440010', 'Underwriting Guidelines', 'passed', 'Meets most underwriting guidelines', 70, 100),
('550e8400-e29b-41d4-a716-446655440010', 'Limits & Deductibles', 'passed', 'Standard limits and deductibles', 75, 100),
('550e8400-e29b-41d4-a716-446655440010', 'Pricing Factors', 'failed', 'Higher risk pricing', 60, 100),
('550e8400-e29b-41d4-a716-446655440010', 'Hazard Classification', 'failed', 'Medium hazard classification, survey recommended', 55, 100),

-- Chemical Plant (reject)
('550e8400-e29b-41d4-a716-446655440011', 'Underwriting Guidelines', 'failed', 'Does not meet several underwriting guidelines', 40, 100),
('550e8400-e29b-41d4-a716-446655440011', 'Limits & Deductibles', 'failed', 'Requested limits exceed our capacity', 30, 100),
('550e8400-e29b-41d4-a716-446655440011', 'Pricing Factors', 'failed', 'High risk pricing', 35, 100),
('550e8400-e29b-41d4-a716-446655440011', 'Hazard Classification', 'failed', 'High hazard classification', 35, 100);

-- Insert pending actions
INSERT INTO pending_actions (title, description, priority, stage, "submissionId") VALUES
(
    'Review Missing Information',
    'GreenTech Solutions Ltd. submission is missing business description and claims history',
    'high',
    'Missing Data Check',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    'Verify Compliance Check',
    'Manual review required for Parsian Evin Hotel Ltd. compliance check',
    'medium',
    'Compliance Check',
    '550e8400-e29b-41d4-a716-446655440006'
),
(
    'Approve Quotation',
    'Final approval needed for Office Complex Ltd. quotation',
    'low',
    'Guideline Check',
    '550e8400-e29b-41d4-a716-446655440009'
),
(
    'Schedule Survey',
    'Industrial Warehouse requires on-site survey before proceeding',
    'high',
    'Guideline Check',
    '550e8400-e29b-41d4-a716-446655440010'
),
(
    'Complete Compliance Checks',
    'Coffee Haven Ltd. has pending compliance checks',
    'medium',
    'Compliance Check',
    '550e8400-e29b-41d4-a716-446655440007'
);

-- Insert email drafts
INSERT INTO email_drafts ("submissionId", subject, content, email_type) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Additional Information Required - SUB-2024-001',
    'Dear ABC Insurance Brokers,

We are reviewing the submission for GreenTech Solutions Ltd. (reference: SUB-2024-001) and require some additional information to proceed with the quotation process.

Please provide the following:
1. A detailed description of business operations
2. 5-year claims history
3. Construction type and materials information for the property

Thank you for your assistance.

Best regards,
InsureFlow Team',
    'missing_data'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Duplicate Submission Notification - SUB-2024-003',
    'Dear Industrial Insurance,

We have identified that the submission for Global Manufacturing (reference: SUB-2024-003) appears to be a duplicate of an existing submission in our system (reference: SUB-2024-001A) submitted by Risk Partners on April 15, 2024.

To avoid processing duplicate submissions, we will be proceeding with the original submission. If you believe this is an error or if there are significant differences between the submissions, please let us know.

Best regards,
InsureFlow Team',
    'duplicate'
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    'Unable to Proceed - Compliance Issues - SUB-2024-006',
    'Dear Prime Insurance Brokers,

We regret to inform you that we are unable to proceed with the submission for Parsian Evin Hotel Ltd. (reference: SUB-2024-006) due to compliance issues.

Our compliance checks have identified that the client appears on the OFAC sanctions list, which prevents us from providing coverage.

If you believe this is an error or if you have additional information that may affect this decision, please contact our compliance team.

Best regards,
InsureFlow Team',
    'compliance'
);
