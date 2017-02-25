/**!
 * Adapted from Google Closure Library, math.js
 *
 *
 * Copyright 2006 The Closure Library Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * The % operator in JavaScript returns the remainder of a / b, but differs from
 * some other languages in that the result will have the same sign as the
 * dividend. For example, -1 % 8 == -1, whereas in some other languages
 * (such as Python) the result would be 7. This function emulates the more
 * correct modulo behavior, which is useful for certain applications such as
 * calculating an offset index in a circular list.
 *
 * @param {number} a The dividend.
 * @param {number} b The divisor.
 * @return {number} a % b where the result is between 0 and b (either 0 <= x < b
 *     or b < x <= 0, depending on the sign of b).
 */
const modulo = (a, b) => {
    var r = a % b;
    // If r and b differ in sign, add b to wrap the result to the correct sign.
    return (r * b < 0) ? r + b : r;
};

/**
 * Converts radians to degrees.
 * @param {number} angleRadians Angle in radians.
 * @return {number} Angle in degrees.
 */
const toDegrees = angleRadians => {
    return angleRadians * 180 / Math.PI;
};

/**
 * Normalizes an angle to be in range [0-360). Angles outside this range will
 * be normalized to be the equivalent angle with that range.
 * @param {number} angle Angle in degrees.
 * @return {number} Standardized angle.
 */
const standardAngle = angle => modulo(angle, 360);

/**
 * Computes the angle between two points (x1,y1) and (x2,y2).
 * Angle zero points in the +X direction, 90 degrees points in the +Y
 * direction (down) and from there we grow clockwise towards 360 degrees.
 * @param {number} x1 x of first point.
 * @param {number} y1 y of first point.
 * @param {number} x2 x of second point.
 * @param {number} y2 y of second point.
 * @return {number} Standardized angle in degrees of the vector from
 *     x1,y1 to x2,y2.
 */
const angle = (x1, y1, x2, y2) => {
    return standardAngle(toDegrees(Math.atan2(y2 - y1, x2 - x1)));
};

/**
 * Calculates distance between two points given 4 points.
 * @param {number} x1 X value of the first point
 * @param {number} y1 Y value of the first point
 * @param {number} x2 X value of the second point
 * @param {number} y2 Y value of the second point
 * @return {number} Distance between two points
 */
const distance = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2;


/**
 * Performs linear interpolation between values a and b. Returns the value
 * between a and b proportional to x (when x is between 0 and 1. When x is
 * outside this range, the return value is a linear extrapolation).
 * @param {number} a A number.
 * @param {number} b A number.
 * @param {number} x The proportion between a and b.
 * @return {number} The interpolated value between a and b.
 */
const lerp = (a, b, x) => {
  return a + x * (b - a);
};

export default {
    angle: angle,
    distance: distance,
    lerp: lerp
}
