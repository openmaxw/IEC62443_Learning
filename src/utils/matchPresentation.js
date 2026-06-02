import { MATCH_STATUSES } from '../data/matchStatuses';

export function getMatchStatusLabel(status) {
  return MATCH_STATUSES[status]?.label || '不满足';
}

export function getMatchStatusVariant(status) {
  return MATCH_STATUSES[status]?.badge || 'danger';
}
