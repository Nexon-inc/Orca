export function formatUserFriendlyBadge(tool: string): string {
  const lower = tool.toLowerCase();
  if (lower.includes('twitter') || lower.includes('tweet') || lower.includes('x_post')) {
    return 'Posted announcement on X';
  }
  if (lower.includes('hubspot') && lower.includes('deal')) {
    return 'Created deal in HubSpot';
  }
  if (lower.includes('github') && (lower.includes('pr') || lower.includes('pull_request'))) {
    return 'Opened Pull Request on GitHub';
  }
  if (lower.includes('linkedin')) {
    return 'Shared update on LinkedIn';
  }
  if (lower.includes('slack')) {
    return 'Sent message in Slack';
  }
  if (lower.includes('notion')) {
    return 'Created page in Notion';
  }
  if (lower.includes('facebook')) {
    return 'Published post on Facebook';
  }
  if (lower.includes('instagram')) {
    return 'Uploaded media to Instagram';
  }
  if (lower.includes('email') || lower.includes('gmail')) {
    return 'Sent email outreach';
  }
  return `Executed ${tool.replace(/_/g, ' ')}`;
}
