export const isFeatureFlagEnabled = (feature: string) => {
  const FeatureFlag = localStorage.getItem('feature-flag') ?? ''
  return FeatureFlag.split(',').includes(feature)
}
