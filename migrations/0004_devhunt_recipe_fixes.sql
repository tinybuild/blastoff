-- 0004_devhunt_recipe_fixes.sql
-- Live-verified fixes from end-to-end test 2026-05-22:
--   submit_url was /submit (404); real form at /account/tools/new
--   pricing radio values were stale (5 listed, only 3 live)
--   launch_week reality: $49 for every slot in next 13mo
--   ease: easy → hard (paid in practice)

UPDATE directories
SET submit_url = 'https://devhunt.org/account/tools/new',
    ease = 'hard',
    ease_reason = '$49 wall on every launch week for next 13mo; one free slot exists ~June 2027'
WHERE slug = 'devhunt';

UPDATE directory_fields
SET dropdown_values = 'Free / Subscription / One time fee (verified live 2026-05-22; recipe previously listed 5 values that no longer exist)',
    selector = '`input[name="pricing-type"]` (radio)',
    notes = 'radios rendered as `<input type="radio">`; match by label text'
WHERE directory_id = (SELECT id FROM directories WHERE slug = 'devhunt')
  AND field_name = 'pricing';

UPDATE directory_fields
SET dropdown_values = 'upcoming ISO weeks; nearly all show 15+ queued = $49. Only sparse slots ~13 months out are free',
    selector = '`select[name="launch_week"]` (combobox)',
    notes = '$49 in practice; skill should warn the user before they pick a paid week'
WHERE directory_id = (SELECT id FROM directories WHERE slug = 'devhunt')
  AND field_name = 'launch_week';
