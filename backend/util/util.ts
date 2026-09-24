export class SystemUtil {
    static converObjIdToString(object: { id: bigint }) {
        return object.id.toString();
    }
}
