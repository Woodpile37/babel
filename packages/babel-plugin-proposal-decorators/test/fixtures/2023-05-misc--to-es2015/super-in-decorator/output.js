class A extends B {
  m() {
    var _initClass, _obj, _dec, _obj2, _dec2, _initProto;
    let _C;
    _obj = this;
    _dec = super.dec1;
    _obj2 = this;
    _dec2 = super.dec2;
    class C {
      constructor(...args) {
        _initProto(this);
      }
      m2() {}
    }
    ({
      e: [_initProto],
      c: [_C, _initClass]
    } = babelHelpers.applyDecs2305(C, [[[_obj2, _dec2], 18, "m2"]], [_obj, _dec], 1));
    _initClass();
  }
}
