function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var color_1 = require("../../color");
var utils_1 = require("../../utils/utils");
var image_source_1 = require("../../image-source");
var css_value_1 = require("../../css-value");
__export(require("./background-common"));
var clearCGColor = utils_1.ios.getter(UIColor, UIColor.clearColor).CGColor;
var symbolUrl = Symbol("backgroundImageUrl");
var ios;
(function (ios) {
    function createBackgroundUIColor(view, callback, flip) {
        var background = view.style.backgroundInternal;
        var nativeView = view.nativeView;
        if (background.hasUniformBorder()) {
            if (nativeView.hasNonUniformBorder) {
                clearNonUniformBorders(nativeView);
            }
            var layer = nativeView.layer;
            var borderColor = background.getUniformBorderColor();
            layer.borderColor = !borderColor ? undefined : borderColor.ios.CGColor;
            layer.borderWidth = utils_1.layout.toDeviceIndependentPixels(background.getUniformBorderWidth());
            var renderSize = view.getActualSize() || { width: 0, height: 0 };
            var cornerRadius = utils_1.layout.toDeviceIndependentPixels(background.getUniformBorderRadius());
            layer.cornerRadius = Math.min(Math.min(renderSize.width / 2, renderSize.height / 2), cornerRadius);
        }
        else {
            drawNonUniformBorders(nativeView, background);
        }
        if (background.clipPath) {
            drawClipPath(nativeView, background);
        }
        if (!background.image) {
            var uiColor = background.color ? background.color.ios : undefined;
            callback(uiColor);
        }
        else {
            setUIColorFromImage(view, nativeView, callback, flip);
        }
    }
    ios.createBackgroundUIColor = createBackgroundUIColor;
})(ios = exports.ios || (exports.ios = {}));
function clearNonUniformBorders(nativeView) {
    if (nativeView.topBorderLayer) {
        nativeView.topBorderLayer.removeFromSuperlayer();
    }
    if (nativeView.rightBorderLayer) {
        nativeView.rightBorderLayer.removeFromSuperlayer();
    }
    if (nativeView.bottomBorderLayer) {
        nativeView.bottomBorderLayer.removeFromSuperlayer();
    }
    if (nativeView.leftBorderLayer) {
        nativeView.leftBorderLayer.removeFromSuperlayer();
    }
}
var pattern = /url\(('|")(.*?)\1\)/;
function setUIColorFromImage(view, nativeView, callback, flip) {
    var frame = nativeView.frame;
    var boundsWidth = view.scaleX ? frame.size.width / view.scaleX : frame.size.width;
    var boundsHeight = view.scaleY ? frame.size.height / view.scaleY : frame.size.height;
    if (!boundsWidth || !boundsHeight) {
        return undefined;
    }
    var style = view.style;
    var background = style.backgroundInternal;
    var imageUri = background.image;
    if (imageUri) {
        var match = imageUri.match(pattern);
        if (match && match[2]) {
            imageUri = match[2];
        }
    }
    var bitmap;
    if (utils_1.isDataURI(imageUri)) {
        var base64Data = imageUri.split(",")[1];
        if (base64Data !== undefined) {
            bitmap = image_source_1.fromBase64(base64Data).ios;
        }
    }
    else if (utils_1.isFileOrResourcePath(imageUri)) {
        bitmap = image_source_1.fromFileOrResource(imageUri).ios;
    }
    else if (imageUri.indexOf("http") !== -1) {
        style[symbolUrl] = imageUri;
        image_source_1.fromUrl(imageUri).then(function (r) {
            if (style && style[symbolUrl] === imageUri) {
                uiColorFromImage(r.ios, view, callback, flip);
            }
        });
    }
    uiColorFromImage(bitmap, view, callback, flip);
}
function parsePosition(pos) {
    var values = css_value_1.parse(pos);
    if (values.length === 2) {
        return { x: values[0], y: values[1] };
    }
    if (values.length === 1 && values[0].type === "ident") {
        var val = values[0].string.toLocaleLowerCase();
        var center = { type: "ident", string: "center" };
        if (val === "left" || val === "right") {
            return { x: values[0], y: center };
        }
        else if (val === "top" || val === "bottom") {
            return { x: center, y: values[0] };
        }
        else if (val === "center") {
            return { x: center, y: center };
        }
    }
    return null;
}
;
function getDrawParams(image, background, width, height) {
    if (!image) {
        return null;
    }
    var res = {
        repeatX: true,
        repeatY: true,
        posX: 0,
        posY: 0,
    };
    if (background.repeat) {
        switch (background.repeat.toLowerCase()) {
            case "no-repeat":
                res.repeatX = false;
                res.repeatY = false;
                break;
            case "repeat-x":
                res.repeatY = false;
                break;
            case "repeat-y":
                res.repeatX = false;
                break;
        }
    }
    var imageSize = image.size;
    var imageWidth = imageSize.width;
    var imageHeight = imageSize.height;
    var size = background.size;
    if (size) {
        var values = css_value_1.parse(size);
        if (values.length === 2) {
            var vx = values[0];
            var vy = values[1];
            if (vx.unit === "%" && vy.unit === "%") {
                imageWidth = width * vx.value / 100;
                imageHeight = height * vy.value / 100;
                res.sizeX = imageWidth;
                res.sizeY = imageHeight;
            }
            else if (vx.type === "number" && vy.type === "number" &&
                ((vx.unit === "px" && vy.unit === "px") || (vx.unit === "" && vy.unit === ""))) {
                imageWidth = vx.value;
                imageHeight = vy.value;
                res.sizeX = imageWidth;
                res.sizeY = imageHeight;
            }
        }
        else if (values.length === 1 && values[0].type === "ident") {
            var scale = 0;
            if (values[0].string === "cover") {
                scale = Math.max(width / imageWidth, height / imageHeight);
            }
            else if (values[0].string === "contain") {
                scale = Math.min(width / imageWidth, height / imageHeight);
            }
            if (scale > 0) {
                imageWidth *= scale;
                imageHeight *= scale;
                res.sizeX = imageWidth;
                res.sizeY = imageHeight;
            }
        }
    }
    var position = background.position;
    if (position) {
        var v = parsePosition(position);
        if (v) {
            var spaceX = width - imageWidth;
            var spaceY = height - imageHeight;
            if (v.x.unit === "%" && v.y.unit === "%") {
                res.posX = spaceX * v.x.value / 100;
                res.posY = spaceY * v.y.value / 100;
            }
            else if (v.x.type === "number" && v.y.type === "number" &&
                ((v.x.unit === "px" && v.y.unit === "px") || (v.x.unit === "" && v.y.unit === ""))) {
                res.posX = v.x.value;
                res.posY = v.y.value;
            }
            else if (v.x.type === "ident" && v.y.type === "ident") {
                if (v.x.string.toLowerCase() === "center") {
                    res.posX = spaceX / 2;
                }
                else if (v.x.string.toLowerCase() === "right") {
                    res.posX = spaceX;
                }
                if (v.y.string.toLowerCase() === "center") {
                    res.posY = spaceY / 2;
                }
                else if (v.y.string.toLowerCase() === "bottom") {
                    res.posY = spaceY;
                }
            }
        }
    }
    return res;
}
function uiColorFromImage(img, view, callback, flip) {
    if (!img) {
        callback(null);
        return;
    }
    var nativeView = view.nativeView;
    var background = view.style.backgroundInternal;
    var frame = nativeView.frame;
    var boundsWidth = view.scaleX ? frame.size.width / view.scaleX : frame.size.width;
    var boundsHeight = view.scaleY ? frame.size.height / view.scaleY : frame.size.height;
    var params = getDrawParams(img, background, boundsWidth, boundsHeight);
    if (params.sizeX > 0 && params.sizeY > 0) {
        var resizeRect = CGRectMake(0, 0, params.sizeX, params.sizeY);
        UIGraphicsBeginImageContext(resizeRect.size);
        img.drawInRect(resizeRect);
        img = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
    }
    UIGraphicsBeginImageContextWithOptions(CGSizeFromString("{" + boundsWidth + "," + boundsHeight + "}"), false, 0.0);
    var context = UIGraphicsGetCurrentContext();
    if (background.color && background.color.ios) {
        CGContextSetFillColorWithColor(context, background.color.ios.CGColor);
        CGContextFillRect(context, CGRectMake(0, 0, boundsWidth, boundsHeight));
    }
    if (!params.repeatX && !params.repeatY) {
        img.drawAtPoint(CGPointMake(params.posX, params.posY));
    }
    else {
        var w = params.repeatX ? boundsWidth : img.size.width;
        var h = params.repeatY ? boundsHeight : img.size.height;
        CGContextSetPatternPhase(context, CGSizeMake(params.posX, params.posY));
        params.posX = params.repeatX ? 0 : params.posX;
        params.posY = params.repeatY ? 0 : params.posY;
        var patternRect = CGRectMake(params.posX, params.posY, w, h);
        img.drawAsPatternInRect(patternRect);
    }
    var bkgImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    if (flip) {
        var flippedImage = _flipImage(bkgImage);
        callback(UIColor.alloc().initWithPatternImage(flippedImage));
    }
    else {
        callback(UIColor.alloc().initWithPatternImage(bkgImage));
    }
}
function _flipImage(originalImage) {
    UIGraphicsBeginImageContextWithOptions(originalImage.size, false, 0.0);
    var context = UIGraphicsGetCurrentContext();
    CGContextSaveGState(context);
    CGContextTranslateCTM(context, 0.0, originalImage.size.height);
    CGContextScaleCTM(context, 1.0, -1.0);
    originalImage.drawInRect(CGRectMake(0, 0, originalImage.size.width, originalImage.size.height));
    CGContextRestoreGState(context);
    var flippedImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return flippedImage;
}
function cssValueToDeviceIndependentPixels(source, total) {
    source = source.trim();
    if (source.indexOf("px") !== -1) {
        return utils_1.layout.toDeviceIndependentPixels(parseFloat(source.replace("px", "")));
    }
    else if (source.indexOf("%") !== -1 && total > 0) {
        return (parseFloat(source.replace("%", "")) / 100) * total;
    }
    else {
        return parseFloat(source);
    }
}
function drawNonUniformBorders(nativeView, background) {
    var layer = nativeView.layer;
    layer.borderColor = undefined;
    layer.borderWidth = 0;
    layer.cornerRadius = 0;
    var layerBounds = layer.bounds;
    var layerOrigin = layerBounds.origin;
    var layerSize = layerBounds.size;
    var nativeViewLayerBounds = {
        left: layerOrigin.x,
        top: layerOrigin.y,
        bottom: layerSize.height,
        right: layerSize.width
    };
    var top = utils_1.layout.toDeviceIndependentPixels(background.borderTopWidth);
    var right = utils_1.layout.toDeviceIndependentPixels(background.borderRightWidth);
    var bottom = utils_1.layout.toDeviceIndependentPixels(background.borderBottomWidth);
    var left = utils_1.layout.toDeviceIndependentPixels(background.borderLeftWidth);
    var lto = { x: nativeViewLayerBounds.left, y: nativeViewLayerBounds.top };
    var lti = { x: nativeViewLayerBounds.left + left, y: nativeViewLayerBounds.top + top };
    var rto = { x: nativeViewLayerBounds.right, y: nativeViewLayerBounds.top };
    var rti = { x: nativeViewLayerBounds.right - right, y: nativeViewLayerBounds.top + top };
    var rbo = { x: nativeViewLayerBounds.right, y: nativeViewLayerBounds.bottom };
    var rbi = { x: nativeViewLayerBounds.right - right, y: nativeViewLayerBounds.bottom - bottom };
    var lbo = { x: nativeViewLayerBounds.left, y: nativeViewLayerBounds.bottom };
    var lbi = { x: nativeViewLayerBounds.left + left, y: nativeViewLayerBounds.bottom - bottom };
    var hasNonUniformBorder;
    if (nativeView.topBorderLayer) {
        nativeView.topBorderLayer.removeFromSuperlayer();
    }
    if (nativeView.rightBorderLayer) {
        nativeView.rightBorderLayer.removeFromSuperlayer();
    }
    if (nativeView.bottomBorderLayer) {
        nativeView.bottomBorderLayer.removeFromSuperlayer();
    }
    if (nativeView.leftBorderLayer) {
        nativeView.leftBorderLayer.removeFromSuperlayer();
    }
    var borderTopColor = background.borderTopColor;
    if (top > 0 && borderTopColor && borderTopColor.ios) {
        var topBorderPath = CGPathCreateMutable();
        CGPathMoveToPoint(topBorderPath, null, lto.x, lto.y);
        CGPathAddLineToPoint(topBorderPath, null, rto.x, rto.y);
        CGPathAddLineToPoint(topBorderPath, null, rti.x, rti.y);
        CGPathAddLineToPoint(topBorderPath, null, lti.x, lti.y);
        CGPathAddLineToPoint(topBorderPath, null, lto.x, lto.y);
        var topBorderLayer = CAShapeLayer.layer();
        topBorderLayer.fillColor = background.borderTopColor.ios.CGColor;
        topBorderLayer.path = topBorderPath;
        layer.addSublayer(topBorderLayer);
        nativeView.topBorderLayer = topBorderLayer;
        hasNonUniformBorder = true;
    }
    var borderRightColor = background.borderRightColor;
    if (right > 0 && borderRightColor && borderRightColor.ios) {
        var rightBorderPath = CGPathCreateMutable();
        CGPathMoveToPoint(rightBorderPath, null, rto.x, rto.y);
        CGPathAddLineToPoint(rightBorderPath, null, rbo.x, rbo.y);
        CGPathAddLineToPoint(rightBorderPath, null, rbi.x, rbi.y);
        CGPathAddLineToPoint(rightBorderPath, null, rti.x, rti.y);
        CGPathAddLineToPoint(rightBorderPath, null, rto.x, rto.y);
        var rightBorderLayer = CAShapeLayer.layer();
        rightBorderLayer.fillColor = background.borderRightColor.ios.CGColor;
        rightBorderLayer.path = rightBorderPath;
        layer.addSublayer(rightBorderLayer);
        nativeView.rightBorderLayer = rightBorderLayer;
        hasNonUniformBorder = true;
    }
    var borderBottomColor = background.borderBottomColor;
    if (bottom > 0 && borderBottomColor && borderBottomColor.ios) {
        var bottomBorderPath = CGPathCreateMutable();
        CGPathMoveToPoint(bottomBorderPath, null, rbo.x, rbo.y);
        CGPathAddLineToPoint(bottomBorderPath, null, lbo.x, lbo.y);
        CGPathAddLineToPoint(bottomBorderPath, null, lbi.x, lbi.y);
        CGPathAddLineToPoint(bottomBorderPath, null, rbi.x, rbi.y);
        CGPathAddLineToPoint(bottomBorderPath, null, rbo.x, rbo.y);
        var bottomBorderLayer = CAShapeLayer.layer();
        bottomBorderLayer.fillColor = background.borderBottomColor.ios.CGColor;
        bottomBorderLayer.path = bottomBorderPath;
        layer.addSublayer(bottomBorderLayer);
        nativeView.bottomBorderLayer = bottomBorderLayer;
        hasNonUniformBorder = true;
    }
    var borderLeftColor = background.borderLeftColor;
    if (left > 0 && borderLeftColor && borderLeftColor.ios) {
        var leftBorderPath = CGPathCreateMutable();
        CGPathMoveToPoint(leftBorderPath, null, lbo.x, lbo.y);
        CGPathAddLineToPoint(leftBorderPath, null, lto.x, lto.y);
        CGPathAddLineToPoint(leftBorderPath, null, lti.x, lti.y);
        CGPathAddLineToPoint(leftBorderPath, null, lbi.x, lbi.y);
        CGPathAddLineToPoint(leftBorderPath, null, lbo.x, lbo.y);
        var leftBorderLayer = CAShapeLayer.layer();
        leftBorderLayer.fillColor = background.borderLeftColor.ios.CGColor;
        leftBorderLayer.path = leftBorderPath;
        layer.addSublayer(leftBorderLayer);
        nativeView.leftBorderLayer = leftBorderLayer;
        hasNonUniformBorder = true;
    }
    nativeView.hasNonUniformBorder = hasNonUniformBorder;
}
function drawClipPath(nativeView, background) {
    var layer = nativeView.layer;
    var layerBounds = layer.bounds;
    var layerOrigin = layerBounds.origin;
    var layerSize = layerBounds.size;
    var bounds = {
        left: layerOrigin.x,
        top: layerOrigin.y,
        bottom: layerSize.height,
        right: layerSize.width
    };
    if (bounds.right === 0 || bounds.bottom === 0) {
        return;
    }
    var path;
    var clipPath = background.clipPath;
    var functionName = clipPath.substring(0, clipPath.indexOf("("));
    var value = clipPath.replace(functionName + "(", "").replace(")", "");
    switch (functionName) {
        case "rect":
            path = rectPath(value, bounds);
            break;
        case "inset":
            path = insetPath(value, bounds);
            break;
        case "circle":
            path = circlePath(value, bounds);
            break;
        case "ellipse":
            path = ellipsePath(value, bounds);
            break;
        case "polygon":
            path = polygonPath(value, bounds);
            break;
    }
    if (path) {
        var shape = CAShapeLayer.layer();
        shape.path = path;
        layer.mask = shape;
        nativeView.clipsToBounds = true;
        var borderWidth = background.getUniformBorderWidth();
        var borderColor = background.getUniformBorderColor();
        if (borderWidth > 0 && borderColor instanceof color_1.Color) {
            var borderLayer = CAShapeLayer.layer();
            borderLayer.path = path;
            borderLayer.lineWidth = borderWidth * 2;
            borderLayer.strokeColor = borderColor.ios.CGColor;
            borderLayer.fillColor = clearCGColor;
            borderLayer.frame = nativeView.bounds;
            layer.borderColor = undefined;
            layer.borderWidth = 0;
            layer.addSublayer(borderLayer);
        }
    }
}
function rectPath(value, bounds) {
    var arr = value.split(/[\s]+/);
    var top = cssValueToDeviceIndependentPixels(arr[0], bounds.top);
    var right = cssValueToDeviceIndependentPixels(arr[1], bounds.right);
    var bottom = cssValueToDeviceIndependentPixels(arr[2], bounds.bottom);
    var left = cssValueToDeviceIndependentPixels(arr[3], bounds.left);
    return UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right - left, bottom - top)).CGPath;
}
function insetPath(value, bounds) {
    var arr = value.split(/[\s]+/);
    var topString;
    var rightString;
    var bottomString;
    var leftString;
    if (arr.length === 1) {
        topString = rightString = bottomString = leftString = arr[0];
    }
    else if (arr.length === 2) {
        topString = bottomString = arr[0];
        rightString = leftString = arr[1];
    }
    else if (arr.length === 3) {
        topString = arr[0];
        rightString = leftString = arr[1];
        bottomString = arr[2];
    }
    else if (arr.length === 4) {
        topString = arr[0];
        rightString = arr[1];
        bottomString = arr[2];
        leftString = arr[3];
    }
    var top = cssValueToDeviceIndependentPixels(topString, bounds.bottom);
    var right = cssValueToDeviceIndependentPixels("100%", bounds.right) - cssValueToDeviceIndependentPixels(rightString, bounds.right);
    var bottom = cssValueToDeviceIndependentPixels("100%", bounds.bottom) - cssValueToDeviceIndependentPixels(bottomString, bounds.bottom);
    var left = cssValueToDeviceIndependentPixels(leftString, bounds.right);
    return UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right - left, bottom - top)).CGPath;
}
function circlePath(value, bounds) {
    var arr = value.split(/[\s]+/);
    var radius = cssValueToDeviceIndependentPixels(arr[0], (bounds.right > bounds.bottom ? bounds.bottom : bounds.right) / 2);
    var y = cssValueToDeviceIndependentPixels(arr[2], bounds.bottom);
    var x = cssValueToDeviceIndependentPixels(arr[3], bounds.right);
    return UIBezierPath.bezierPathWithArcCenterRadiusStartAngleEndAngleClockwise(CGPointMake(x, y), radius, 0, 360, true).CGPath;
}
function ellipsePath(value, bounds) {
    var arr = value.split(/[\s]+/);
    var rX = cssValueToDeviceIndependentPixels(arr[0], bounds.right);
    var rY = cssValueToDeviceIndependentPixels(arr[1], bounds.bottom);
    var cX = cssValueToDeviceIndependentPixels(arr[3], bounds.right);
    var cY = cssValueToDeviceIndependentPixels(arr[4], bounds.bottom);
    var left = cX - rX;
    var top = cY - rY;
    var width = rX * 2;
    var height = rY * 2;
    return UIBezierPath.bezierPathWithOvalInRect(CGRectMake(left, top, width, height)).CGPath;
}
function polygonPath(value, bounds) {
    var path = CGPathCreateMutable();
    var firstPoint;
    var arr = value.split(/[,]+/);
    for (var i = 0; i < arr.length; i++) {
        var xy = arr[i].trim().split(/[\s]+/);
        var point = {
            x: cssValueToDeviceIndependentPixels(xy[0], bounds.right),
            y: cssValueToDeviceIndependentPixels(xy[1], bounds.bottom)
        };
        if (!firstPoint) {
            firstPoint = point;
            CGPathMoveToPoint(path, null, point.x, point.y);
        }
        CGPathAddLineToPoint(path, null, point.x, point.y);
    }
    CGPathAddLineToPoint(path, null, firstPoint.x, firstPoint.y);
    return path;
}
//# sourceMappingURL=background.js.map