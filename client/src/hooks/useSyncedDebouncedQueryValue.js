import { useEffect, useState } from "react";

const normalizeQueryValue = (value) => String(value ?? "").trim();

export default function useSyncedDebouncedQueryValue({
  searchParams,
  queryKey,
  debounceMs = 250,
}) {
  const initialValue = normalizeQueryValue(searchParams.get(queryKey));
  const [inputValue, setInputValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs]);

  useEffect(() => {
    const valueFromUrl = normalizeQueryValue(searchParams.get(queryKey));

    if (valueFromUrl !== inputValue) {
      setInputValue(valueFromUrl);
    }

    if (valueFromUrl !== debouncedValue) {
      setDebouncedValue(valueFromUrl);
    }
  }, [searchParams, queryKey, inputValue, debouncedValue]);

  return {
    inputValue,
    setInputValue,
    debouncedValue,
  };
}
