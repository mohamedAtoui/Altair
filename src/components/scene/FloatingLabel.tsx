import { Text } from '@react-three/drei';
import { usePresentationStore } from '../../stores/usePresentationStore';

export function FloatingLabels() {
  const snapshots = usePresentationStore((s) => s.snapshots);
  const activeIndex = usePresentationStore((s) => s.activeIndex);

  const active = snapshots[activeIndex];
  if (!active || !active.labels.length) return null;

  return (
    <>
      {active.labels.map((label) => (
        <Text
          key={label.id}
          position={label.position}
          fontSize={0.2}
          color="rgba(255,255,255,0.9)"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.01}
          outlineColor="#000000"
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
        >
          {label.text}
        </Text>
      ))}
    </>
  );
}
