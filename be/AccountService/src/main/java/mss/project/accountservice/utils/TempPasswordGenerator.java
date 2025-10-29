package mss.project.accountservice.utils;
import java.security.SecureRandom;

public final class TempPasswordGenerator {
    private static final String UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijkmnopqrstuvwxyz";
    private static final String DIGIT = "23456789";
    private static final String SYMBOL = "@#$%&*?";
    private static final String ALL = UPPER + LOWER + DIGIT + SYMBOL;
    private static final SecureRandom RND = new SecureRandom();

    public static String generate(int len) {
        // đảm bảo có đủ loại ký tự
        StringBuilder sb = new StringBuilder();
        sb.append(pick(UPPER)).append(pick(LOWER)).append(pick(DIGIT)).append(pick(SYMBOL));
        for (int i = 4; i < len; i++) sb.append(pick(ALL));
        return shuffle(sb.toString());
    }
    private static char pick(String s){ return s.charAt(RND.nextInt(s.length())); }
    private static String shuffle(String s){
        char[] a = s.toCharArray();
        for (int i = a.length-1; i > 0; i--){
            int j = RND.nextInt(i+1);
            char t = a[i]; a[i]=a[j]; a[j]=t;
        }
        return new String(a);
    }
}
