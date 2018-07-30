/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2018, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

import 'sources/slickgrid/formatters';

describe('EWKB formatter test', function () {
  let EWKBFromatter = window.Slick.Formatters.EWKB;
  const row = undefined;
  const cell = undefined;

  describe('format supported geometry', function () {
    it('should return the view button for geometry', function () {
      // POINT(0 0)
      let ewkb = '010100000000000000000000000000000000000000';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
    it('should return the view button for geometry', function () {
      // LINESTRING(0 0,1 1,1 2)
      let ewkb = '01020000000300000000000000000000000000000000000000000000000000' +
        'F03F000000000000F03F000000000000F03F0000000000000040';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
    it('should return the view button for geometry', function () {
      // GEOMETRYCOLLECTION(POINT(2 3),LINESTRING(2 3,3 4))
      let ewkb = '01070000000200000001010000000000000000000040000000000000084001' +
        '02000000020000000000000000000040000000000000084000000000000008400000000' +
        '000001040';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
    it('should return the view button for geometry', function () {
      // SRID=32632;POINT(0 0)
      let ewkb = '0101000020787F000000000000000000000000000000000000';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
    it('should return the view button for geometry', function () {
      // SRID=4326;MULTIPOINTM(0 0 0,1 2 1)
      let ewkb = '0104000060E610000002000000010100004000000000000000000000000000' +
        '00000000000000000000000101000040000000000000F03F00000000000000400000000' +
        '00000F03F';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
    it('should return the view button for geometry', function () {
      // GEOMETRYCOLLECTION(POINT(2 3),LINESTRING(2 3,3 4))
      let ewkb = '01070000000200000001010000000000000000000040000000000000084001' +
        '02000000020000000000000000000040000000000000084000000000000008400000000' +
        '000001040';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
    it('should return the view button for geometry', function () {
      // POINT EMPTY
      let ewkb = '0101000000000000000000F87F000000000000F87F';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
    it('should return the view button for geometry', function () {
      // LINESTRING EMPTY
      let ewkb = '010200000000000000';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
    it('should return the view button for geometry', function () {
      // POLYGON EMPTY
      let ewkb = '010300000000000000';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
    it('should return the view button for geometry', function () {
      // MULTIPOINT EMPTY
      let ewkb = '010400000000000000';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
    it('should return the view button for geometry', function () {
      // GEOMETRYCOLLECTION EMPTY
      let ewkb = '010700000000000000';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('View geometry');
    });
  });

  describe('format 3d geometry', function () {
    it('should return the disabled button for 3d geometry', function () {
      // POINT(0 0 0)
      let ewkb = '0101000080000000000000F03F000000000000F03F000000000000F03F';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('Can not render 3d geometry');
    });

    it('should return the disabled button for 3d geometry', function () {
      // POINT(0 0 0 0)
      let ewkb = '01010000C00000000000000000000000000000000000000000000000000000' +
        '000000000000';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('Can not render 3d geometry');
    });

    it('should return the disabled button for 3d geometry', function () {
      let ewkb = '01060000800200000001030000800200000005000000000000000000000000' +
        '00000000000000000000000000000000000000000010400000000000000000000000000' +
        '00000000000000000001040000000000000104000000000000000000000000000000000' +
        '00000000000010400000000000000000000000000000000000000000000000000000000' +
        '00000000005000000000000000000F03F000000000000F03F0000000000000000000000' +
        '0000000040000000000000F03F000000000000000000000000000000400000000000000' +
        '0400000000000000000000000000000F03F000000000000004000000000000000000000' +
        '00000000F03F000000000000F03F0000000000000000010300008001000000050000000' +
        '00000000000F0BF000000000000F0BF0000000000000000000000000000F0BF00000000' +
        '000000C0000000000000000000000000000000C000000000000000C0000000000000000' +
        '000000000000000C0000000000000F0BF0000000000000000000000000000F0BF000000' +
        '000000F0BF0000000000000000';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('Can not render 3d geometry');
    });
  });

  describe('format unsupported geometry type', function () {
    it('should return the disabled button for unsupported geometry', function () {
      let ewkb = '';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('Can not render geometry of this type');
    });
    it('should return the disabled button for unsupported geometry', function () {
      // MULTICURVE( (0 0, 5 5), CIRCULARSTRING(4 0, 4 4, 8 4) )
      let ewkb = '010B0000000200000001020000000200000000000000000000000000000000' +
        '00000000000000000014400000000000001440010800000003000000000000000000104' +
        '00000000000000000000000000000104000000000000010400000000000002040000000' +
        '0000001040';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('Can not render geometry of this type');
    });
    it('should return the disabled button for unsupported geometry', function () {
      // POLYHEDRALSURFACE( ((0 0 0, 0 0 1, 0 1 1, 0 1 0, 0 0 0)), ((0 0 0, 0 1 0, 1 1 0, 1 0 0, 0 0 0)), ((0 0 0, 1 0 0, 1 0 1, 0 0 1, 0 0 0)), ((1 1 0, 1 1 1, 1 0 1, 1 0 0, 1 1 0)), ((0 1 0, 0 1 1, 1 1 1, 1 1 0, 0 1 0)), ((0 0 1, 1 0 1, 1 1 1, 0 1 1, 0 0 1)) )
      let ewkb = '010F0000800600000001030000800100000005000000000000000000000000' +
        '00000000000000000000000000000000000000000000000000000000000000000000000' +
        '000F03F0000000000000000000000000000F03F000000000000F03F0000000000000000' +
        '000000000000F03F0000000000000000000000000000000000000000000000000000000' +
        '00000000001030000800100000005000000000000000000000000000000000000000000' +
        '0000000000000000000000000000000000000000F03F000000000000000000000000000' +
        '0F03F000000000000F03F0000000000000000000000000000F03F000000000000000000' +
        '00000000000000000000000000000000000000000000000000000000000000010300008' +
        '00100000005000000000000000000000000000000000000000000000000000000000000' +
        '000000F03F00000000000000000000000000000000000000000000F03F0000000000000' +
        '000000000000000F03F00000000000000000000000000000000000000000000F03F0000' +
        '00000000000000000000000000000000000000000000010300008001000000050000000' +
        '00000000000F03F000000000000F03F0000000000000000000000000000F03F00000000' +
        '0000F03F000000000000F03F000000000000F03F0000000000000000000000000000F03' +
        'F000000000000F03F00000000000000000000000000000000000000000000F03F000000' +
        '000000F03F0000000000000000010300008001000000050000000000000000000000000' +
        '000000000F03F00000000000000000000000000000000000000000000F03F0000000000' +
        '00F03F000000000000F03F000000000000F03F000000000000F03F000000000000F03F0' +
        '00000000000F03F00000000000000000000000000000000000000000000F03F00000000' +
        '00000000010300008001000000050000000000000000000000000000000000000000000' +
        '0000000F03F000000000000F03F0000000000000000000000000000F03F000000000000' +
        'F03F000000000000F03F000000000000F03F0000000000000000000000000000F03F000' +
        '000000000F03F00000000000000000000000000000000000000000000F03F';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('Can not render geometry of this type');
    });
    it('should return the disabled button for unsupported geometry', function () {
      // TRIANGLE ((0 0, 0 9, 9 0, 0 0))
      let ewkb = '01110000000100000004000000000000000000000000000000000000000000' +
        '00000000000000000000000022400000000000002240000000000000000000000000000' +
        '000000000000000000000';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('Can not render geometry of this type');
    });
    it('should return the disabled button for unsupported geometry', function () {
      // TIN( ((0 0 0, 0 0 1, 0 1 0, 0 0 0)), ((0 0 0, 0 1 0, 1 1 0, 0 0 0)) )
      let ewkb = '01100000800200000001110000800100000004000000000000000000000000' +
        '00000000000000000000000000000000000000000000000000000000000000000000000' +
        '000F03F0000000000000000000000000000F03F00000000000000000000000000000000' +
        '00000000000000000000000000000000011100008001000000040000000000000000000' +
        '000000000000000000000000000000000000000000000000000000000000000F03F0000' +
        '000000000000000000000000F03F000000000000F03F000000000000000000000000000' +
        '0000000000000000000000000000000000000';
      expect(EWKBFromatter(row, cell, ewkb)).toContain('Can not render geometry of this type');
    });
  });
});
