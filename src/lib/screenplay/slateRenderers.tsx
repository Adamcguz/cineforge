import type { RenderElementProps, RenderLeafProps } from 'slate-react';
import type { ScriptElement } from '@/types';

/** Page break set + page count, passed from ScriptEditor */
export interface PageBreakContext {
  breakIds: Set<string>;
  pageCount: number;
}

/** Tracks the running page number across renders */
let _pageNum = 1;
export function resetPageCounter() {
  _pageNum = 1;
}

function PageBreakLine({ page }: { page: number }) {
  return (
    <div
      contentEditable={false}
      className="relative select-none pointer-events-none my-6"
      style={{ userSelect: 'none' }}
    >
      <div className="border-t border-dashed border-gray-300" />
      <span className="absolute -top-2.5 right-0 text-[10px] text-gray-400 bg-white px-2 rounded">
        p. {page}
      </span>
    </div>
  );
}

export function createRenderElement(ctx: PageBreakContext) {
  return function renderElementWithBreaks(props: RenderElementProps) {
    const { attributes, children, element } = props;
    const el = element as ScriptElement;

    const showBreak = el.id && ctx.breakIds.has(el.id);
    if (showBreak) _pageNum++;

    const inner = renderCoreElement(el.type, attributes, children);

    if (showBreak) {
      return (
        <>
          <PageBreakLine page={_pageNum} />
          {inner}
        </>
      );
    }

    return inner;
  };
}

function renderCoreElement(
  type: string,
  attributes: RenderElementProps['attributes'],
  children: RenderElementProps['children']
) {
  switch (type) {
    case 'act':
      return (
        <div {...attributes} className="text-center uppercase font-bold py-2">
          {children}
        </div>
      );

    case 'scene-heading':
      return (
        <div {...attributes} className="uppercase font-bold mt-4 mb-1 text-gray-900 bg-gray-200/70 px-2 py-1 rounded">
          {children}
        </div>
      );

    case 'action':
      return (
        <div {...attributes} className="my-1">
          {children}
        </div>
      );

    case 'character':
      return (
        <div {...attributes} className="uppercase mt-3 mb-0" style={{ marginLeft: '40%' }}>
          {children}
        </div>
      );

    case 'dialogue':
      return (
        <div {...attributes} className="my-0" style={{ marginLeft: '25%', marginRight: '25%' }}>
          {children}
        </div>
      );

    case 'parenthetical':
      return (
        <div {...attributes} className="my-0 text-gray-400" style={{ marginLeft: '30%', marginRight: '30%' }}>
          {children}
        </div>
      );

    case 'transition':
      return (
        <div {...attributes} className="text-right uppercase mt-3 mb-1">
          {children}
        </div>
      );

    case 'shot':
      return (
        <div {...attributes} className="uppercase mt-2 mb-1">
          {children}
        </div>
      );

    case 'text':
      return (
        <div {...attributes} className="my-1">
          {children}
        </div>
      );

    default:
      return (
        <div {...attributes} className="my-1">
          {children}
        </div>
      );
  }
}

/** Legacy default export for non-editor uses (read-only previews, etc.) */
export function renderElement(props: RenderElementProps) {
  const { attributes, children, element } = props;
  const el = element as ScriptElement;
  return renderCoreElement(el.type, attributes, children);
}

export function renderLeaf({ attributes, children, leaf }: RenderLeafProps) {
  let content = children;
  if (leaf.bold) {
    content = <strong>{content}</strong>;
  }
  if (leaf.italic) {
    content = <em>{content}</em>;
  }
  return <span {...attributes}>{content}</span>;
}
