"use client";

import React from "react";
import { Plate, PlateContent } from "@udecode/plate";
import {
  createPlugins,
  createParagraphPlugin,
} from "@udecode/plate";
import {
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
} from "@udecode/plate-basic-marks";

export default function Editor({ value, onChange }) {
  const plugins = createPlugins(
    [
      createParagraphPlugin(),
      createBoldPlugin(),
      createItalicPlugin(),
      createUnderlinePlugin(),
    ],
    {
      components: {},
    }
  );

  return (
    <div className="border rounded p-4 bg-white">
      <Plate
        value={value}
        onChange={onChange}
        plugins={plugins}
      >
        <PlateContent className="min-h-[250px] p-2 border rounded" />
      </Plate>
    </div>
  );
}
