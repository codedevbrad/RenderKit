import { interpolate, useCurrentFrame} from 'remotion';
 
export const Title: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
 
  return (
    <div style={{opacity, textAlign: 'center', fontSize: '7em'}}>{title}</div>
  );
};
 