export const getPackages = async () => {
  const res = await fetch("http://localhost:5000/api/packages");
  if (!res.ok) throw new Error("데이터 로드 실패");
  return await res.json();
};
