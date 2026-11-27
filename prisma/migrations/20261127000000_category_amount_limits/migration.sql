BEGIN;

LOCK TABLE "ExpenseRequest" IN ACCESS EXCLUSIVE MODE;

-- Fail closed if the inherited named CHECK is missing, unvalidated or changed.
DO $$
DECLARE old_definition TEXT;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO old_definition
  FROM pg_constraint
  WHERE conrelid = '"ExpenseRequest"'::regclass
    AND conname = 'ExpenseRequest_amountBaht_check' AND contype = 'c' AND convalidated;
  IF old_definition IS DISTINCT FROM 'CHECK ((("amountBaht" >= 1) AND ("amountBaht" <= 100000)))' THEN
    RAISE EXCEPTION 'Unexpected pre-change expense amount CHECK; migration stopped';
  END IF;
END $$;

ALTER TABLE "ExpenseRequest" DROP CONSTRAINT "ExpenseRequest_amountBaht_check";
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_amountBaht_check"
CHECK (
  ("category" = 'ACTIVITY' AND "amountBaht" BETWEEN 1 AND 150000)
  OR ("category" = 'EQUIPMENT' AND "amountBaht" BETWEEN 1 AND 120000)
  OR ("category" = 'TRAVEL' AND "amountBaht" BETWEEN 1 AND 100000)
);

-- No row/event rewrites. Do not restore the old CHECK over newly valid larger rows.
COMMIT;
