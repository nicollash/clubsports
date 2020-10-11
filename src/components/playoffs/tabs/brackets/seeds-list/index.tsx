import React from "react";
import { IBracketSeed } from "components/playoffs/bracketGames";
import SeedCard from "./seed-card";
import styles from "./styles.module.scss";

interface IProps {
  accept: string;
  reorderMode: boolean;
  seeds: IBracketSeed[];
  moveSeed: (dragIndex: number, hoverIndex: number) => void;
}

export default (props: IProps) => {
  const { accept, seeds, reorderMode, moveSeed } = props;

  return (
    <div className={styles.container}>
      {seeds.map((item, index) => (
        <div key={`${index}-renderSeed`} className={styles.singleSeedWrapper}>
          <span>{index + 1}.</span>
          <SeedCard
            id={item.id}
            type={accept}
            index={index}
            teamName={item.teamName}
            isReorderMode={reorderMode}
            moveCard={moveSeed}
          />
        </div>
      ))}
    </div>
  );
};
