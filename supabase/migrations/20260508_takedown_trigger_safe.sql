-- Replace the auto-unpublish trigger with a safer version.
-- The original trigger in 20260503 immediately set is_published=false on any
-- takedown insert, meaning any anonymous user submitting a DMCA claim could
-- instantly remove any song from the site.
--
-- New behaviour: insert a takedown row (status='received') but do NOT touch
-- the song. The song is only unpublished when an admin explicitly upholds the
-- claim via the /admin/takedowns review queue.

create or replace function handle_new_takedown()
  returns trigger language plpgsql security definer as $$
begin
  -- Intentionally a no-op on insert.
  -- Unpublishing happens in the admin review action when status is set to 'upheld'.
  return new;
end;
$$;
