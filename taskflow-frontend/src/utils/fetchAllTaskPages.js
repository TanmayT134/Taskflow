/**
 * Fetch every task page without issuing one request per page in series.
 * Requests are made in small batches to avoid overwhelming the API/database.
 * The first page is supplied by the caller so it can be shared with other UI data.
 */
export async function fetchAllTaskPages(firstPage, params, getTasks, batchSize = 4) {
  const content = [...(firstPage?.content || [])];
  const totalPages = Math.max(0, Number(firstPage?.totalPages || 0));

  for (let start = 1; start < totalPages; start += batchSize) {
    const end = Math.min(start + batchSize, totalPages);
    const pageNumbers = Array.from({ length: end - start }, (_, index) => start + index);
    const pages = await Promise.all(
      pageNumbers.map((page) => getTasks({ ...params, page }))
    );
    pages.forEach((page) => content.push(...(page?.content || [])));
  }

  return content;
}
