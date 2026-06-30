INSERT INTO accounts (id, name) VALUES ('019f16e5-a577-735b-ab0c-1bf76017cf2f', 'Alice');
INSERT INTO accounts (id, name) VALUES ('019f16e6-692e-7599-9df3-f511ec6bd68e', 'Bob');
INSERT INTO accounts (id, name) VALUES ('019f16e6-8c0a-7c18-bf3d-d5f3a98e989b', 'System Vault');
INSERT INTO transactions (id, note) VALUES ('019f16ea-d0ba-783b-a686-59163eafcee3', 'System Initialization');
INSERT INTO journal_entries (id, transaction_id, account_id, debit, credit) VALUES ('019f16ea-f770-780e-a10b-6d308dbb7f4a', '019f16ea-d0ba-783b-a686-59163eafcee3', '019f16e5-a577-735b-ab0c-1bf76017cf2f', 100000, 0);
INSERT INTO journal_entries (id, transaction_id, account_id, debit, credit) VALUES ('019f16eb-a48f-73b7-9700-238020aa78aa', '019f16ea-d0ba-783b-a686-59163eafcee3', '019f16e6-8c0a-7c18-bf3d-d5f3a98e989b', 0, 100000);