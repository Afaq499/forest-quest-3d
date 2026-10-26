import { AssetModel } from './AssetModel.tsx';
import { PlaceholderRock, PlaceholderTree, ThornBush } from './placeholders.tsx';
import { HAZARDS, ROCKS, TREES } from '../game/level.ts';
import { useSlotUrl } from '../game/slotContext.ts';

export function Obstacles() {
  const treeUrl = useSlotUrl('tree');
  const rockUrl = useSlotUrl('rock');

  return (
    <group>
      {TREES.map((tree) => (
        <group key={tree.id} position={[tree.x, 0, tree.z]} rotation={[0, tree.yaw, 0]} scale={tree.scale}>
          {treeUrl ? (
            <AssetModel slot="tree" url={treeUrl} fallback={<PlaceholderTree tint={tree.tint} />} />
          ) : (
            <PlaceholderTree tint={tree.tint} />
          )}
        </group>
      ))}
      {ROCKS.map((rock) => (
        <group key={rock.id} position={[rock.x, 0, rock.z]} rotation={[0, rock.yaw, 0]} scale={rock.scale}>
          {rockUrl ? (
            <AssetModel slot="rock" url={rockUrl} fallback={<PlaceholderRock tint={rock.tint} />} />
          ) : (
            <PlaceholderRock tint={rock.tint} />
          )}
        </group>
      ))}
      {HAZARDS.map((hazard) => (
        <group key={hazard.id} position={[hazard.x, 0, hazard.z]}>
          <ThornBush scale={hazard.scale} />
        </group>
      ))}
    </group>
  );
}
