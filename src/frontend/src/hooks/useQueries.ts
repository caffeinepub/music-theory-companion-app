import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetAllKeys() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['allKeys'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllKeys();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllTheoryTopics() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['allTheoryTopics'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTheoryTopics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetChordProgressions(key: string) {
  const { actor, isFetching } = useActor();

  return useQuery<string[] | null>({
    queryKey: ['chordProgressions', key],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getChordProgressions(key);
    },
    enabled: !!actor && !isFetching && !!key,
  });
}

export function useGetScaleInformation(key: string) {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['scaleInformation', key],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getScaleInformation(key);
    },
    enabled: !!actor && !isFetching && !!key,
  });
}

export function useGetTheoryExplanation(topic: string) {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['theoryExplanation', topic],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTheoryExplanation(topic);
    },
    enabled: !!actor && !isFetching && !!topic,
  });
}

export function useGetImprovisationTips(key: string) {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['improvisationTips', key],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getImprovisationTips(key);
    },
    enabled: !!actor && !isFetching && !!key,
  });
}

export function useGetCompositionSuggestions(key: string) {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['compositionSuggestions', key],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCompositionSuggestions(key);
    },
    enabled: !!actor && !isFetching && !!key,
  });
}
