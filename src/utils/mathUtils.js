class MathUtils {
  constructor() {}

  arrayMax (array) {
    return array.reduce((a, b) => Math.max(a, b));
  }

  arrayMin (array) {
    return array.reduce((a, b) => Math.min(a, b));
  }

  arrayTotal (array) {
    return array.reduce((acc, f) => acc + f, 0);
  }

  arrayAvg (array) {
    return this.arrayTotal(array) / array.length;
  }

  rounder (method, num, n, zeroPadding = false) {
    const pow = Math.pow(10, n);
    let result;
    switch (method) {
      case 'floor':
        result = Math.floor(num * pow) / pow;
        break;
      case 'ceil':
        result = Math.ceil(num * pow) / pow;
        break;
      case 'round':
        result = Math.round(num * pow) / pow;
        break;
      default:
        throw new Error('Invalid rounding method specified.');
    }
    if (zeroPadding) {
      return result.toFixed(n);
    } else {
      return result;
    }
  }

  formatFileSize (bytes, decimals = 2) {
    if (bytes === 0) return '0 byte';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

export default MathUtils;
