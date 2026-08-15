export default function GenerateButton({ loading, onClick }) {
  return (
    <button className="btn-generate" disabled={loading} onClick={onClick} id="generate-btn">
      {loading ? (
        <>
          <span className="spinner" />
          Generating…
        </>
      ) : (
        <>✦ Generate Painting</>
      )}
    </button>
  );
}
