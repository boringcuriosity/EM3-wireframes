/* The 30 orbs, in one SkSL pass over the gauge.

   The web draws each orb as a textured quad (pr2 in liquid-score/index.html): the orb artwork, greyed and
   dimmed by how empty it is, over a soft green drop shadow read from a blurrier mip level (bias 1.8), blended
   premultiplied (ONE, ONE_MINUS_SRC_ALPHA) in order. Here a single rect runs this shader, which walks the 30
   tiles in the same order and composites them the same way, so it is one draw instead of thirty.

   uOrb    orb.png: the orb at 128px centred in a 256px tile (rasterised from orb.svg exactly as the web draws it)
   uShadow orb-shadow.png: that tile's alpha, box-mipmapped and sampled trilinearly at LOD 4.2, the level the
           web's biased lookup lands on for these orb sizes at 2x. Skia has no LOD bias, so it is baked.
   uO[i]   x, y (dp, tile centre), tile half-size (dp, 0 = not drawn), fill (0 empty .. 1 full)
   uTap    a quarter of a device pixel in dp: the orb is read with four taps a half pixel apart, standing in for
           the web's mipmaps (a 256px tile drawn ~30-90px wide would alias with bilinear alone). */

export const orbSource = `
uniform shader uOrb;
uniform shader uShadow;
uniform float4 uO[30];
uniform float uTap;

half4 main(float2 xy) {
  half4 acc = half4(0.);
  for (int i = 0; i < 30; i++) {
    float4 o = uO[i];
    float2 d = xy - o.xy;
    if (o.z > 0. && abs(d.x) < o.z && abs(d.y) < o.z) {
      float k = 128./o.z;              // texels per dp
      float2 c = (d + o.z)*k;          // texel coordinate in the 256px tile
      float tp = uTap*k;
      half4 tx = (uOrb.eval(c + float2(-tp, -tp)) + uOrb.eval(c + float2(tp, -tp)) +
                  uOrb.eval(c + float2(-tp, tp)) + uOrb.eval(c + float2(tp, tp)))*.25;
      half F = half(o.w), e = 1. - F;
      // premultiplied; empty orbs stay crisp, only greyed
      half3 rgb = min(mix(tx.rgb, half3(dot(tx.rgb, half3(.299, .587, .114))*1.35), e), half3(tx.a));
      half4 orb = half4(rgb, tx.a)*(.5 + .5*F);
      // soft green drop shadow under filled orbs, a touch below the orb (the web's uv - .03)
      half sh = uShadow.eval(c + float2(0., -.03*256.)).a*.22*F;
      half4 s = orb + half4(half3(.02, .376, .227)*sh, sh)*(1. - orb.a);
      acc = s + acc*(1. - s.a);
    }
  }
  return acc;
}
`;
