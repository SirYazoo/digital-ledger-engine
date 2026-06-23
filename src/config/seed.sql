INSERT INTO accounts (id, name) VALUES ('480f48ff-d913-4ed1-a586-07f5c14c87b1', 'Alice');
INSERT INTO accounts (id, name) VALUES ('2bd8ce20-cb8b-4e07-a09a-deb04cf5cc0e', 'Bob');
INSERT INTO transactions (id, note) VALUES ('32f2f1fc-e64f-4fcb-96c8-cf80e0bca4af', 'System Initialization');
INSERT INTO journal_entries (id, transaction_id, account_id, debit, credit) VALUES ('9c1222b5-6844-4c69-bd39-66e1ff4ff78b', '32f2f1fc-e64f-4fcb-96c8-cf80e0bca4af', '480f48ff-d913-4ed1-a586-07f5c14c87b1', 100000, 0);