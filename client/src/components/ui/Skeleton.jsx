/**
 * Skeleton Loader Components
 * Used for loading states — maintains layout during data fetching.
 */

export function Skeleton({ width = '100%', height = '16px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 6, ...style }}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="task-card" style={{ cursor: 'default', gap: 12 }}>
      <Skeleton height="14px" width="60%" />
      <Skeleton height="12px" width="80%" />
      <div style={{ display: 'flex', gap: 6 }}>
        <Skeleton height="20px" width="60px" />
        <Skeleton height="20px" width="50px" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <Skeleton height="12px" width="80px" />
        <Skeleton height="20px" width="55px" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card" style={{ cursor: 'default' }}>
      <Skeleton height="10px" width="50%" />
      <Skeleton height="36px" width="60px" />
      <Skeleton height="10px" width="70%" />
    </div>
  );
}
