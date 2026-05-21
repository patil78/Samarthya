-- Add company_job_id column to opportunities table
-- This links opportunities to company_job_postings for full integration

ALTER TABLE opportunities 
ADD COLUMN company_job_id INT AFTER org_sector_id,
ADD COLUMN skills TEXT AFTER duration,
ADD COLUMN description TEXT AFTER skills,
ADD COLUMN vacancies INT DEFAULT 1 AFTER description,
ADD COLUMN min_score DECIMAL(5,2) DEFAULT 0 AFTER vacancies;

-- Add foreign key constraint
ALTER TABLE opportunities
ADD CONSTRAINT fk_opportunities_company_job
FOREIGN KEY (company_job_id) REFERENCES company_job_postings(job_id)
ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_opportunities_company_job_id ON opportunities(company_job_id);

-- Display updated structure
DESCRIBE opportunities;

SELECT 'Opportunities table enhanced successfully!' AS status;
