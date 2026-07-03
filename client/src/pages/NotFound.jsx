export default function NotFound() {
  return (
    <div className="empty-state" style={{ minHeight: '70vh' }}>
      <div className="empty-state-icon" style={{ fontSize: '4rem' }}>404</div>
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-ghost" style={{ marginTop: 8 }}>← Back to Dashboard</a>
    </div>
  );
}
