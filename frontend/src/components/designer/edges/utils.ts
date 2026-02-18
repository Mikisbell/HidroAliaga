
import { type Node, type InternalNode } from '@xyflow/react';

// Get the intersection point between the line (from node center to node center) and the node border
export function getNodeIntersection(intersectionNode: Node, targetNode: Node) {
    // https://math.stackexchange.com/questions/228841/how-do-i-calculate-the-intersection-point-of-the-boundary-of-two-rectangles
    const {
        width: w = intersectionNode.measured?.width ?? intersectionNode.width ?? 0,
        height: h = intersectionNode.measured?.height ?? intersectionNode.height ?? 0,
        position: { x: x1, y: y1 },
    } = intersectionNode;

    const targetPosition = targetNode.position;
    const {
        width: w2 = targetNode.measured?.width ?? targetNode.width ?? 0,
        height: h2 = targetNode.measured?.height ?? targetNode.height ?? 0
    } = targetNode;

    const x2 = targetPosition.x + w2 / 2;
    const y2 = targetPosition.y + h2 / 2;

    const xx1 = x1 + w / 2;
    const yy1 = y1 + h / 2;

    const dx = x2 - xx1;
    const dy = y2 - yy1;

    if (dx === 0 && dy === 0) {
        return { x: xx1, y: yy1 };
    }

    // Calculate intersection for axis-aligned rectangle
    // Using simple ratio comparison logic
    // Calculate relative position of target center from intersection node center
    // If |dy/dx| < h/w, intersection is on left/right sides
    // Else, intersection is on top/bottom sides

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let x = 0;
    let y = 0;

    // Aspect ratio of the node
    // Avoid division by zero
    if (w === 0 || h === 0) return { x: xx1, y: yy1 };

    // Calculate intersection with the box centered at (0,0) with dims w,h
    // Line equation: Y = (dy/dx) * X

    // Check if intersection with vertical lines x = +/- w/2
    // We need to compare slopes.
    // Slope of line = dy / dx. Slope of diagonal = h / w.

    const slopeLine = absDy / absDx;
    const slopeDiag = h / w;

    if (slopeLine <= slopeDiag) {
        // Intersects vertical sides (Left/Right)
        // x is +/- w/2
        x = (Math.sign(dx) || 1) * w / 2;
        y = x * (dy / dx);
    } else {
        // Intersects horizontal sides (Top/Bottom)
        // y is +/- h/2
        y = (Math.sign(dy) || 1) * h / 2;
        x = y * (dx / dy);
    }

    return { x: xx1 + x, y: yy1 + y };
}

// Calculate parameters for the edge
export function getEdgeParams(source: Node, target: Node) {
    const sourceIntersection = getNodeIntersection(source, target);
    const targetIntersection = getNodeIntersection(target, source);

    return {
        sx: sourceIntersection.x,
        sy: sourceIntersection.y,
        tx: targetIntersection.x,
        ty: targetIntersection.y,
    };
}
