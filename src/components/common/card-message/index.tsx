import React from "react";
import { getIcon } from "helpers/get-icon.helper";
import { CardMessageTypes } from "./types";
import styles from "./styles.module.scss";

interface Props {
  children: any;
  type: CardMessageTypes;
  style?: object;
  iconStyle?: object;
}

const CardMessage = ({ children, type, style, iconStyle }: Props) => (
  <p className={styles.CardMessage} style={style}>
    {getIcon(type, iconStyle)}
    {children}
  </p>
);

export default CardMessage;
