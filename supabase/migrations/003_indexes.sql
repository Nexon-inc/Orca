-- ============================================================
-- ORCA Database Schema — 003 Indexes
-- ============================================================

create index idx_org_members_org_id on public.org_members(org_id);
create index idx_org_members_user_id on public.org_members(user_id);
create index idx_departments_org_id on public.departments(org_id);
create index idx_agents_department_id on public.agents(department_id);
create index idx_conversations_user_id on public.conversations(user_id);
create index idx_conversations_agent_id on public.conversations(agent_id);
create index idx_conversations_org_id on public.conversations(org_id);
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_messages_status on public.messages(status);
create index idx_team_messages_from_user on public.team_messages(from_user_id);
create index idx_team_messages_to_user on public.team_messages(to_user_id);
create index idx_coordination_events_org on public.coordination_events(org_id);
create index idx_coordination_events_status on public.coordination_events(status);
create index idx_approval_requests_org on public.approval_requests(org_id);
create index idx_approval_requests_status on public.approval_requests(status);
create index idx_integrations_org_id on public.integrations(org_id);
create index idx_audit_logs_org_id on public.audit_logs(org_id);
create index idx_audit_logs_actor on public.audit_logs(actor_user_id);
create index idx_invite_tokens_token on public.invite_tokens(token);
create index idx_invite_tokens_email on public.invite_tokens(email);
