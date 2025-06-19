// Summary cards component
async function GuidelineSummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-[120px] w-full bg-gray-200 rounded-md flex items-center justify-center text-gray-600"
        >
          Dummy Card {i + 1}
        </div>
      ))}
    </div>
  );
}
