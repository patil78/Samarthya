import pandas as pd
from sqlalchemy import create_engine, text
from sklearn.metrics.pairwise import cosine_similarity
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from sentence_transformers import SentenceTransformer
import json
import uuid
from datetime import datetime

# --- CONFIGURATION ---
DB_CONNECTION_STRING = "mysql+pymysql://root:MyNewPassword123!@localhost/samarthya_db"
# !! SECURITY RISK: Replace this with environment variables in a real application !!
SENDER_EMAIL = "heliobhatt123@gmail.com"
EMAIL_PASSWORD = "zshb wbzy bhja dqud"
# Student Allocation Limits
MAX_OFFERS = 2
MAX_WAITING = 2

# Get the directory where this script is located
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ssl_cert_path = os.path.join(BASE_DIR, "isrgrootx1.pem")

ssl_args = {
    "ssl_ca": ssl_cert_path
}    


# --- DB CONNECTION & AI MODEL ---
engine = create_engine("mysql+pymysql://2p6u58mMBxe8vS4.root:Z9A4YzsaLtwXXHmZ@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/samarthya_db", connect_args=ssl_args, pool_recycle=3600)
model = SentenceTransformer('all-MiniLM-L6-v2')

# --- EMAIL FUNCTION (Updated to handle waiting number) ---
def send_email(receiver, student_name, role_name, company_name, score, profile_id, opportunity_id, status, waiting_rank=None):
    sender = SENDER_EMAIL
    password = EMAIL_PASSWORD

    accept_link = f"http://localhost:8000/api/respond?profile_id={profile_id}&opportunity_id={opportunity_id}&response=Accepted"
    reject_link = f"http://localhost:8000/api/respond?profile_id={profile_id}&opportunity_id={opportunity_id}&response=Rejected"

    subject = f"Internship Allocation - {company_name}"
    
    if status == "Allocated":
        action_html = f"""
            <a href="{accept_link}" style="padding:10px 20px; background-color:green; color:white; text-decoration:none; border-radius:5px;">✅ Accept</a>
            &nbsp;&nbsp;
            <a href="{reject_link}" style="padding:10px 20px; background-color:red; color:white; text-decoration:none; border-radius:5px;">❌ Reject</a>
        """
        status_text = f"You have been allocated an internship at **{company_name}** for the role **{role_name}**."
    else: # Waiting
        action_html = f"<p style='color:#ffa500;'>Please wait for further notification.</p>"
        status_text = f"You are currently on the waiting list (Rank **#{waiting_rank}**) for the role **{role_name}** at **{company_name}**."

    msg = MIMEMultipart("alternative")
    msg["From"] = sender
    msg["To"] = receiver
    msg["Subject"] = subject

    # Plain text content
    text = f"""
    Dear {student_name},
    
    {status_text}
    Your Score: {score:.2f}
    
    Accept: {accept_link}
    Reject: {reject_link}
    """

    # HTML content
    html = f"""
    <html>
      <body>
        <p>Dear {student_name},<br><br>
            {status_text}<br>
            Your Score: {score:.2f}<br><br>
            {action_html}
        </p>
      </body>
    </html>
    """

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, receiver, msg.as_string())
        print(f"📩 Email sent to {receiver} ({status})")
    except Exception as e:
        print(f"❌ Failed to send email to {receiver}: {e}")

# --- SCORING FUNCTIONS (Same as before) ---
def skill_score(student_skills_json, company_skills):
    if not student_skills_json or not company_skills:
        return 0.0
    
    try:
        # Extract skills from JSON and join them
        skills_list = json.loads(student_skills_json.strip())
        student_text = " ".join([s.strip() for s in skills_list if s.strip()])
    except (json.JSONDecodeError, TypeError):
        # Fallback if the data isn't clean JSON
        student_text = str(student_skills_json).replace(",", " ").lower()

    company_text = " ".join([s.strip() for s in company_skills.split(",") if s.strip()])

    if not student_text or not company_text:
        return 0.0

    # Convert to embeddings
    student_emb = model.encode(student_text)
    company_emb = model.encode(company_text)

    # Cosine similarity
    score = cosine_similarity([student_emb], [company_emb])[0][0]
    return float(score)

# --- NEW FILTERING FUNCTION ---
def qualification_matches(student_qual, required_qual):
    # This implements a simple exact or partial match. Can be expanded for complexity.
    if not required_qual:
        return True
    
    student_qual_lower = str(student_qual).lower().strip()
    required_qual_lower = str(required_qual).lower().strip()
    
    # Simple check if required is a substring of student qualification (e.g., 'B.Tech' matches 'B.Tech in CS')
    return required_qual_lower in student_qual_lower

# --- MAIN ALLOCATION LOGIC (Completely rewritten) ---
def run_allocation():
    # Fetch all data needed for allocation. We use opportunity_id as the grouping/allocation unit.
    # NOTE: This query requires the database schema from your prompt and assumes
    # student_preferences.preference_id serves as the preference rank (1st, 2nd, etc.)
    match_query = """
    SELECT
        sp.profile_id,
        sp.name AS student_name,
        u.email,
        sp.qualification AS student_qualification,
        JSON_UNQUOTE(JSON_EXTRACT(r.extracted_skills, '$')) AS student_skills_json,
        op.opportunity_id,
        op.role AS opportunity_role,
        op.location AS opportunity_location,
        os.sector_id,
        s.sector_name AS opportunity_sector,
        op.skills_required AS required_skills,
        op.education_required,
        op.seats AS seats,
        op.min_score,
        o.name AS organization_name,
        op.stipend,
        -- Assuming lower preference_id means higher preference rank (1, 2, 3...)
        (SELECT MIN(spr.preference_id) FROM student_preferences spr WHERE spr.profile_id = sp.profile_id AND spr.opportunity_id = op.opportunity_id) AS preference_rank
    FROM student_profiles sp
    JOIN users u ON sp.user_id = u.user_id
    JOIN resumes r ON sp.profile_id = r.profile_id
    JOIN student_preferences spr_main ON sp.profile_id = spr_main.profile_id
    JOIN opportunities op ON spr_main.opportunity_id = op.opportunity_id
    JOIN organization_sectors os ON op.org_sector_id = os.org_sector_id
    JOIN organizations o ON os.organization_id = o.organization_id
    JOIN sectors s ON os.sector_id = s.sector_id
    ORDER BY sp.profile_id, preference_rank;
    """
    
    try:
        full_df = pd.read_sql(text(match_query), engine)
        print(f"📊 Loaded {len(full_df)} student-opportunity pairs from database")
        if len(full_df) > 0:
            print(f"   Sample data: {full_df[['student_name', 'opportunity_role', 'required_skills']].head(3).to_dict('records')}")
    except Exception as e:
        print(f"❌ Failed to read data from DB. Ensure all tables and data exist. Error: {e}")
        return

    # DataFrames to store final results
    allocation_status_rows = []
    
    # Keep track of student allocation status across all opportunities
    student_allocation_tracker = {}
    
    # Group by student to process preferences sequentially
    student_groups = full_df.groupby("profile_id")

    for profile_id, student_group in student_groups:
        student_info = student_group.iloc[0]
        student_name = student_info["student_name"]
        student_email = student_info["email"]
        
        offers_count = 0
        waiting_count = 0
        
        # Iterate through student's ranked preferences
        for _, row in student_group.sort_values(by="preference_rank").iterrows():
            if offers_count >= MAX_OFFERS and waiting_count >= MAX_WAITING:
                print(f"🛑 Student {student_name} ({profile_id}) reached max allocations/waitlists. Stopping.")
                break

            opportunity_id = row["opportunity_id"]
            
            # --- FILTERING STAGE: Sector -> Role -> Location (Preference Match) ---
            # NOTE: Since the data is pulled via student_preferences (which already links student to opportunity),
            # we assume the act of choosing the opportunity means the student wants that S/R/L combination.
            # The previous code's logic of scoring preference based on index (1.0, 0.8...) is now applied implicitly by the *preference_rank* order.
            
            # --- SCORING STAGE: Skills ---
            skill_match_score = skill_score(row["student_skills_json"], row["required_skills"]) * 100
            
            # --- MIN SCORE CHECK ---
            min_score = row["min_score"]
            score_pass = skill_match_score >= min_score

            # --- QUALIFICATION CHECK ---
            qual_pass = qualification_matches(row["student_qualification"], row["education_required"])

            # Debug logging
            if not score_pass or not qual_pass:
                print(f"   ⚠️ {student_name} filtered out for {row['opportunity_role']}: skill={skill_match_score:.1f} (min={min_score}, pass={score_pass}), qual_pass={qual_pass}")
            
            final_status = "Skipped"

            if score_pass and qual_pass:
                # Student is Qualified. Now check current allocation status for this opportunity.
                
                # Check how many seats are left (simulated by checking existing allocations)
                # Since we are running the whole allocation *before* saving, we must query the DB for current seat status
                # or build a temporary running tally. For simplicity and robustness on first run, we'll assign and then trim.
                
                # The student is a potential candidate. We record the score and move to the ranking phase.
                final_status = "Qualified"

            # Record the result for later ranking within the opportunity
            allocation_status_rows.append({
                "profile_id": profile_id,
                "student_name": student_name,
                "email": student_email,
                "opportunity_id": opportunity_id,
                "role": row["opportunity_role"],
                "company_name": row["organization_name"],
                "sector_name": row["opportunity_sector"],
                "location": row["opportunity_location"],  # ✅ ADD LOCATION
                "seats": row["seats"],
                "min_score": min_score,
                "student_qualification": row["student_qualification"],
                "education_required": row["education_required"],
                "status": final_status, # Temporarily 'Qualified' or 'Skipped'
                "score": skill_match_score,
                "preference_rank": row["preference_rank"]
            })
            
    if not allocation_status_rows:
        print("❌ No matches found after initial filtering.")
        return

    # --- RANKING AND FINAL ASSIGNMENT STAGE ---
    
    allocation_df = pd.DataFrame(allocation_status_rows)
    final_allocation_rows = []
    seat_summary_rows = []

    # Get only Qualified candidates
    qualified_df = allocation_df[allocation_df["status"] == "Qualified"].copy()
    
    print(f"\n📊 Allocation Summary:")
    print(f"   Total processed: {len(allocation_df)}")
    print(f"   Qualified: {len(qualified_df)}")
    print(f"   Skipped: {len(allocation_df[allocation_df['status'] == 'Skipped'])}")
    
    if len(qualified_df) == 0:
        print("⚠️ No qualified candidates found. Check min_score requirements and student qualifications.")
        return
    
    # Update student tracker for final limits
    student_offers = {}
    student_waitlists = {}

    # Group by Opportunity to rank and allocate seats
    for opportunity_id, group in qualified_df.groupby("opportunity_id"):
        
        seats = group["seats"].iloc[0]
        min_score = group["min_score"].iloc[0]
        role_name = group["role"].iloc[0]
        company_name = group["company_name"].iloc[0]
        
        # 1. Rank candidates by score (highest first)
        ranked_candidates = group.sort_values(by="score", ascending=False)
        
        allocated_count = 0
        waiting_list = []
        
        # 2. Iterate through ranked list and apply student caps
        for _, row in ranked_candidates.iterrows():
            pid = row["profile_id"]
            
            # Check student limits
            offers = student_offers.get(pid, 0)
            waiting = student_waitlists.get(pid, 0)
            
            # Check if student already accepted an offer (HIGH PRIORITY CHECK)
            # We assume a separate table or column `accepted_opportunity_id` exists in student_profiles
            # For this initial run, we skip this DB check. The acceptance logic will handle future runs.

            is_allocated = False
            
            if allocated_count < seats:
                # Try to allocate a seat
                if offers < MAX_OFFERS:
                    final_allocation_rows.append(row.to_dict())
                    final_allocation_rows[-1]["status"] = "Allocated"
                    student_offers[pid] = offers + 1
                    allocated_count += 1
                    is_allocated = True
                else:
                    # Not enough offers left for the student, but seats are available. Put on waitlist if possible.
                    if waiting < MAX_WAITING:
                        waiting_list.append(row.to_dict())
                        student_waitlists[pid] = waiting + 1
            else:
                # Seats are full. Put on waitlist if possible.
                if waiting < MAX_WAITING:
                    waiting_list.append(row.to_dict())
                    student_waitlists[pid] = waiting + 1

        
        # 3. Finalize Allocation and Waiting lists for the Opportunity
        
        # Process allocated students
        for row in final_allocation_rows:
            if row["opportunity_id"] == opportunity_id and row["status"] == "Allocated":
                # Send email (no waiting rank needed)
                send_email(row["email"], row["student_name"], role_name, company_name, row["score"], row["profile_id"], opportunity_id, "Allocated")

        # Process waiting students
        for rank, row_dict in enumerate(waiting_list, 1):
            row_dict["status"] = "Waiting"
            final_allocation_rows.append(row_dict)
            # Send email with waiting rank
            send_email(row_dict["email"], row_dict["student_name"], role_name, company_name, row_dict["score"], row_dict["profile_id"], opportunity_id, "Waiting", waiting_rank=rank)


        # 4. Save Seat Summary
        remaining_seats = max(seats - allocated_count, 0)
        seat_summary_rows.append({
            "opportunity_id": opportunity_id,
            "role": role_name,
            "organization_name": company_name,
            "seats": seats,
            "allocated_count": allocated_count,
            "remaining_seats": remaining_seats,
            "min_match_score": min_score
        })
        
    # --- FINAL DB SAVE ---
    
    # 1. Create Allocation Score/Status Table
    final_allocation_df = pd.DataFrame(final_allocation_rows)
    if not final_allocation_df.empty:
        # Columns: profile_id, student_name, email, opportunity_id, role, company_name, score, status
        # Note: 'role' and 'company_name' are added for convenience, even though 'allocation_score' suggests only score.
        # We will create one comprehensive table: `allocation_status`
        
        final_allocation_df = final_allocation_df[[
            "profile_id", "student_name", "email", "opportunity_id", 
            "role", "company_name", "sector_name", "location", "score", "status", "seats", "min_score"
        ]]
        
        # ✅ Rename columns to match database schema
        final_allocation_df = final_allocation_df.rename(columns={
            "email": "student_email",
            "sector_name": "sector",
            "score": "allocation_score"
        })
        
        # ✅ Generate unique allocation_id and timestamp for each row
        final_allocation_df['allocation_id'] = final_allocation_df.apply(lambda row: str(uuid.uuid4()), axis=1)
        final_allocation_df['allocated_at'] = datetime.now()
        
        # IMPORTANT: Read existing allocation_status records that are NOT being processed in this run
        # This preserves records created by the score calculation API (calculate_student_scores)
        try:
            existing_df = pd.read_sql("SELECT * FROM allocation_status", engine)
            
            # Get profile_ids that are being processed in this allocation run
            processed_profile_ids = final_allocation_df['profile_id'].unique().tolist()
            
            # Keep only existing records for students NOT in this allocation run
            preserved_df = existing_df[~existing_df['profile_id'].isin(processed_profile_ids)]
            
            # Combine preserved records with new allocation results
            combined_df = pd.concat([preserved_df, final_allocation_df], ignore_index=True)
            
            # Save combined data
            combined_df.to_sql("allocation_status", engine, if_exists="replace", index=False)
            
            print(f"\n✅ Allocation Status table updated:")
            print(f"   - Preserved {len(preserved_df)} existing records")
            print(f"   - Added/Updated {len(final_allocation_df)} new records")
            print(f"   - Total records: {len(combined_df)}")
            
            # ✅ Print allocation_ids for verification
            print(f"\n📋 Generated allocation IDs:")
            for idx, row in final_allocation_df.iterrows():
                print(f"   - {row['student_name']}: {row['allocation_id']}")
            
        except Exception as e:
            # If table doesn't exist or error reading, just create new
            print(f"   Note: Could not preserve existing records ({e})")
            final_allocation_df.to_sql("allocation_status", engine, if_exists="replace", index=False)
            print("\n✅ Allocation Status table created in DB.")
            
            # ✅ Print allocation_ids for verification
            print(f"\n📋 Generated allocation IDs:")
            for idx, row in final_allocation_df.iterrows():
                print(f"   - {row['student_name']}: {row['allocation_id']}")

        # 2. Create Seat Summary Table
        pd.DataFrame(seat_summary_rows).to_sql("seat_summary", engine, if_exists="replace", index=False)
        print("✅ Seat summary saved in DB.")
    else:
        print("⚠️ No final allocations made. Skipping DB save.")


def process_acceptance_logic(profile_id, accepted_opportunity_id):
    """
    Handles student acceptance: 
    1. Updates accepted opportunity status to 'Accepted'.
    2. Updates ALL other allocations for the student to 'Deactivated/Removed'.
    3. Triggers reallocation for the removed seats.
    """
    with engine.begin() as conn:
        # 1. Update the accepted opportunity status to 'Accepted'
        conn.execute(
            text("""
                UPDATE allocation_status 
                SET status = 'Accepted' 
                WHERE profile_id = :pid AND opportunity_id = :oid
            """),
            {"pid": profile_id, "oid": accepted_opportunity_id}
        )

        # 2. Identify all other opportunities the student was Allocated/Waiting for
        # and set them to 'Deactivated'
        removed_roles_data = conn.execute(
            text("""
                SELECT opportunity_id FROM allocation_status 
                WHERE profile_id = :pid 
                AND status IN ('Allocated', 'Waiting')
                AND opportunity_id != :oid
            """),
            {"pid": profile_id, "oid": accepted_opportunity_id}
        ).fetchall()

        if removed_roles_data:
            # Update all other statuses to 'Deactivated'
            conn.execute(
                text("""
                    UPDATE allocation_status 
                    SET status = 'Deactivated' 
                    WHERE profile_id = :pid 
                    AND status IN ('Allocated', 'Waiting')
                    AND opportunity_id != :oid
                """),
                {"pid": profile_id, "oid": accepted_opportunity_id}
            )
            print(f"Student {profile_id} accepted offer. {len(removed_roles_data)} other offers/waitlists deactivated.")
            
            # 3. Trigger reallocation for the roles where seats were freed up
            for row in removed_roles_data:
                 print(f"Triggering reallocation for freed seat in Opportunity {row[0]}")
                 run_reallocation(specific_opportunity_id=row[0])


def run_reallocation_for_student(profile_id, opportunity_id):
    """
    Reallocation wrapper for FastAPI API.
    Marks student as rejected and reallocates seat to waiting student in that opportunity.
    """
    with engine.begin() as conn:
        conn.execute(
            text("UPDATE allocation_status SET status = 'Rejected' WHERE profile_id = :pid AND opportunity_id = :oid"),
            {"pid": profile_id, "oid": opportunity_id}
        )
    
    # Trigger reallocation for the specific opportunity
    run_reallocation(specific_opportunity_id=opportunity_id)


def run_reallocation(specific_opportunity_id=None):
    """
    Reallocation process. Can be run for a specific opportunity_id or all.
    Corrected to prevent loss of other opportunity data when run for a single ID.
    """
    print("\n♻️ Running reallocation...")
    
    # 1. READ THE ENTIRE ALLOCATION TABLE ONCE
    full_alloc_df = pd.read_sql("SELECT * FROM allocation_status", engine) 
    
    if full_alloc_df.empty:
        print("No allocation data found in DB.")
        return

    updated_rows = []
    seat_summary_rows = []

    if specific_opportunity_id:
        print(f"Targeted reallocation for OID: {specific_opportunity_id}")
        
        # Filter the full DataFrame to process only the necessary groups
        opportunities_to_process = full_alloc_df[full_alloc_df['opportunity_id'] == specific_opportunity_id].copy()
        
        # Get all UNTOUCHED groups for the final save later
        # These rows will be concatenated back at the end, ensuring no data loss.
        untouched_alloc_df = full_alloc_df[full_alloc_df['opportunity_id'] != specific_opportunity_id].copy()
        
    else:
        print("Running full cleanup.")
        opportunities_to_process = full_alloc_df.copy()
        untouched_alloc_df = pd.DataFrame() # Empty if processing everything

    # Group the selected data for processing
    grouped = opportunities_to_process.groupby("opportunity_id")

    # -------------------------------------------------------------------
    # Loop over only the groups that need recalculation (1 group or all)
    # -------------------------------------------------------------------

    for opportunity_id, group in grouped:
        role_name = group["role"].iloc[0]
        company_name = group["company_name"].iloc[0]
        seats = group["seats"].iloc[0]
        min_score = group["min_score"].iloc[0]

        # Split groups. Only count 'Allocated' as occupied seats.
        current_allocated = group[group["status"] == "Allocated"].copy()
        waiting = group[group["status"] == "Waiting"].copy()
        rejected = group[group["status"] == "Rejected"].copy()
        
        # Calculate available seats: total seats - seats currently accepted/allocated
        freed_seats = seats - len(current_allocated)

        print(f"\n🎯 Role: {role_name} @ {company_name}")
        print(f"  Total seats: {seats}, Currently Allocated: {len(current_allocated)}, Freed: {freed_seats}")

        if freed_seats > 0 and not waiting.empty:
            waiting_sorted = waiting.sort_values(by="score", ascending=False)
            
            # Filter waiting list: remove students who already have an 'Accepted' offer
            accepted_students = pd.read_sql(
                text("SELECT DISTINCT profile_id FROM allocation_status WHERE status = 'Accepted'"), 
                engine
            )["profile_id"].tolist()
            
            waiting_eligible = waiting_sorted[
                ~waiting_sorted["profile_id"].isin(accepted_students)
            ].head(freed_seats)

            for idx, row in waiting_eligible.iterrows():
                
                # Update status in the temporary dataframe (promotes the student)
                # Note: We update the 'waiting' copy and ensure the DB is updated immediately
                
                # You must ensure the promotion logic uses 'group' directly or that the subsequent merge captures the promoted status.
                # Since 'waiting' is a copy, we rely on the DB update and then re-merge.
                
                # Update DB immediately (This is key for immediate user feedback/deactivation logic)
                with engine.begin() as conn:
                    conn.execute(
                        text("UPDATE allocation_status SET status = 'Allocated' WHERE profile_id = :pid AND opportunity_id = :oid"),
                        {"pid": row['profile_id'], "oid": opportunity_id}
                    )
                
                print(f"🔄 Promoting {row['student_name']} (ID: {row['profile_id']}) from Waiting → Allocated")

                # Send email (no waiting rank needed)
                send_email(
                    row["email"], row["student_name"], role_name, company_name,
                    row["score"], row["profile_id"], opportunity_id, "Allocated"
                )
                print(f"📧 Email sent to {row['student_name']}")
        
        
        # ------------------------------------------------------------
        # CRITICAL STEP: Re-read the database for this group to capture 
        # the status updates (promotions/rejections) made during the run 
        # if the immediate DB update approach is used.
        # ------------------------------------------------------------
        # For simplicity and correctness after DB updates, let's re-read the group's current state
        # (This is safer than relying on complex in-memory copy updates)
        current_group_data = pd.read_sql(
             text("SELECT * FROM allocation_status WHERE opportunity_id = :oid"),
             engine, params={"oid": opportunity_id}
        )

        # 1. Append the current state of this opportunity to the list for final concatenation
        updated_rows.append(current_group_data)

        # Recalculate seat summary based on the CURRENT database state
        allocated_count = (current_group_data["status"] == "Allocated").sum()
        remaining_seats = max(seats - allocated_count, 0)
        waiting_student_number = (current_group_data["status"] == "Waiting").sum()
        
        seat_summary_rows.append({
            "opportunity_id": opportunity_id,
            "role": role_name,
            "organization_name": company_name,
            "seats": seats,
            "allocated_count": allocated_count,
            "remaining_seats": remaining_seats,
            "min_match_score": min_score,
            "waiting_student_number": waiting_student_number
        })
    
    # ----------------------------------------------------
    # FINAL DB SAVE: Combine processed and untouched data
    # ----------------------------------------------------

    # 1. Combine the newly processed rows (from the loop)
    processed_alloc_update = pd.concat(updated_rows, ignore_index=True)

    # 2. Combine processed rows with the untouched rows (if running targeted reallocation)
    final_alloc = pd.concat([untouched_alloc_df, processed_alloc_update], ignore_index=True)

    # Save the full, corrected allocation table
    final_alloc.to_sql("allocation_status", engine, if_exists="replace", index=False)
    print("\n✅ Allocation Status table updated in DB.")

    # ----------------------------------------------------
    # FINAL SEAT SUMMARY SAVE (Using the fix for data loss)
    # ----------------------------------------------------
    final_summary_df = pd.DataFrame(seat_summary_rows)

    if specific_opportunity_id:
        # Load the ENTIRE existing table
        existing_summary_df = pd.read_sql("SELECT * FROM seat_summary", engine)
        
        # Remove the old row for the specific opportunity
        existing_summary_df = existing_summary_df[
            existing_summary_df['opportunity_id'] != specific_opportunity_id
        ].copy() 
        
        # Combine the untouched rows with the newly calculated row
        final_summary_df = pd.concat([existing_summary_df, final_summary_df], ignore_index=True)

    # Save the full, corrected DataFrame
    final_summary_df.to_sql("seat_summary", engine, if_exists="replace", index=False) 
    print("✅ Reallocation cycle completed and Seat Summary updated.")
   

if __name__ == "__main__":
    print("\n🚀 Running initial allocation...")
    run_allocation()

    print("\n♻️ Running a final reallocation cleanup...")
    run_reallocation()