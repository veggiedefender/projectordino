const storage = window.localStorage

export default function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  function setValue(value: T) {
    storage.setItem(key, JSON.stringify(value))
  }

  const stored = storage.getItem(key)
  if (stored !== null) {
    return [JSON.parse(stored) as T, setValue]
  }

  return [defaultValue, setValue]
}
