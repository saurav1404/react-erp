import * as image from 'assets/emoji.gif';
import * as React from 'react';
import Contact from './Contact';
import * as styles from './Contact.css';

export default function ContactController() {
  return (
    <Contact classNames={styles} image={image as any} />
  );
}
