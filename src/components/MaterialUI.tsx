"use client";

import React from "react";
import { createComponent } from "@lit/react";

import { MdFilledButton } from "@material/web/button/filled-button.js";
import { MdOutlinedButton } from "@material/web/button/outlined-button.js";
import { MdTextButton } from "@material/web/button/text-button.js";
import { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field.js";
import { MdDialog } from "@material/web/dialog/dialog.js";
import { MdIcon } from "@material/web/icon/icon.js";
import { MdList } from "@material/web/list/list.js";
import { MdListItem } from "@material/web/list/list-item.js";

export const FilledButton = createComponent({
  react: React,
  tagName: "md-filled-button",
  elementClass: MdFilledButton,
  events: {
    onClick: "click",
  },
});

export const OutlinedButton = createComponent({
  react: React,
  tagName: "md-outlined-button",
  elementClass: MdOutlinedButton,
  events: {
    onClick: "click",
  },
});

export const TextButton = createComponent({
  react: React,
  tagName: "md-text-button",
  elementClass: MdTextButton,
  events: {
    onClick: "click",
  },
});

export const OutlinedTextField = createComponent({
  react: React,
  tagName: "md-outlined-text-field",
  elementClass: MdOutlinedTextField,
  events: {
    onInput: "input",
    onChange: "change",
  },
});

export const Dialog = createComponent({
  react: React,
  tagName: "md-dialog",
  elementClass: MdDialog,
  events: {
    onOpen: "open",
    onOpened: "opened",
    onClose: "close",
    onClosed: "closed",
    onCancel: "cancel",
  },
});

export const Icon = createComponent({
  react: React,
  tagName: "md-icon",
  elementClass: MdIcon,
});

export const List = createComponent({
  react: React,
  tagName: "md-list",
  elementClass: MdList,
});

export const ListItem = createComponent({
  react: React,
  tagName: "md-list-item",
  elementClass: MdListItem,
});
