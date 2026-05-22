import { useInView } from "./useInView";

export function useScrollAnimation() {
  const { ref } = useInView();
  return ref;
}
