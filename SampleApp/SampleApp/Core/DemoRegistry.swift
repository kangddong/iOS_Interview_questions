import Foundation

/// 모든 데모는 여기 등록한다. 카테고리별 배열에 `AnyDemo(MyDemo.self)`를 추가.
enum DemoRegistry {
    static func demos(in category: DemoCategory) -> [AnyDemo] {
        switch category {
        case .swiftLanguage:
            return [
                AnyDemo(ValueVsReferenceDemo.self),
                AnyDemo(CopyOnWriteDemo.self),
                AnyDemo(GenericsAndPATDemo.self),
                AnyDemo(SomeVsAnyDemo.self),
                AnyDemo(PropertyWrappersDemo.self),
                AnyDemo(ResultBuilderDemo.self),
                AnyDemo(OptionalDemo.self),
                AnyDemo(EnumDemo.self),
                AnyDemo(ErrorHandlingDemo.self),
                AnyDemo(KeyPathDemo.self),
                AnyDemo(ClosuresDemo.self),
                AnyDemo(InitializationDemo.self),
                AnyDemo(OwnershipDemo.self),
                AnyDemo(MutatingInoutDemo.self),
                AnyDemo(MethodDispatchDemo.self),
                AnyDemo(AccessControlDemo.self),
                AnyDemo(SubscriptDemo.self),
                AnyDemo(TypeCastingDemo.self),
                AnyDemo(PatternMatchingDemo.self),
                AnyDemo(EquatableHashableCodableDemo.self),
                AnyDemo(VariadicGenericsDemo.self),
                AnyDemo(POPDemo.self),
                AnyDemo(StringUnicodeDemo.self),
                AnyDemo(RuntimeInternalsDemo.self),
                AnyDemo(AbiResilienceDemo.self),
            ]
        case .memory:
            return [
                AnyDemo(ARCDemo.self),
                AnyDemo(RetainCycleDemo.self),
                AnyDemo(WeakVsUnownedDemo.self),
                AnyDemo(CaptureListDemo.self),
                AnyDemo(AutoreleasepoolDemo.self),
                AnyDemo(HeapVsStackDemo.self),
                AnyDemo(ValueTypeMemoryDemo.self),
                AnyDemo(ARCOptimizationDemo.self),
                AnyDemo(MemoryToolsDemo.self),
            ]
        case .concurrency:
            return [
                AnyDemo(GCDDemo.self),
                AnyDemo(OperationQueueDemo.self),
                AnyDemo(RunLoopDemo.self),
                AnyDemo(AsyncAwaitDemo.self),
                AnyDemo(ActorDemo.self),
                AnyDemo(MainActorDemo.self),
                AnyDemo(SendableDemo.self),
                AnyDemo(AsyncSequenceDemo.self),
                AnyDemo(ContinuationDemo.self),
                AnyDemo(ConcurrencyPitfallsDemo.self),
                AnyDemo(Swift6StrictDemo.self),
            ]
        case .uikit:
            return [
                AnyDemo(AppLifecycleDemo.self),
                AnyDemo(VCLifecycleDemo.self),
                AnyDemo(AutoLayoutDemo.self),
                AnyDemo(FrameVsBoundsDemo.self),
                AnyDemo(ResponderChainDemo.self),
                AnyDemo(RenderingPipelineDemo.self),
                AnyDemo(OffscreenRenderingDemo.self),
                AnyDemo(CoreAnimationDemo.self),
                AnyDemo(TableCollectionDemo.self),
                AnyDemo(RunLoopDeepDemo.self),
            ]
        case .swiftui:
            return [
                AnyDemo(DeclarativeViewDemo.self),
                AnyDemo(StateManagementDemo.self),
                AnyDemo(ViewIdentityDemo.self),
                AnyDemo(ViewGraphDiffingDemo.self),
                AnyDemo(LayoutSystemDemo.self),
                AnyDemo(CustomLayoutDemo.self),
                AnyDemo(SwiftUIPerformanceDemo.self),
                AnyDemo(ObservationMacroDemo.self),
            ]
        case .architecture:
            return [
                AnyDemo(MVCDemo.self),
                AnyDemo(MVVMDemo.self),
                AnyDemo(CoordinatorDemo.self),
                AnyDemo(DIDemo.self),
                AnyDemo(CleanArchitectureDemo.self),
                AnyDemo(TCALiteDemo.self),
                AnyDemo(ModularizationDemo.self),
                AnyDemo(NamingConventionsDemo.self),
            ]
        case .networking:
            return [
                AnyDemo(URLSessionDemo.self),
                AnyDemo(CodableDemo.self),
                AnyDemo(CodableDeepDemo.self),
                AnyDemo(CustomCodablePolymorphismDemo.self),
                AnyDemo(DTODemo.self),
                AnyDemo(JSONStrategiesDemo.self),
                AnyDemo(APIClientDemo.self),
                AnyDemo(RequestInterceptorDemo.self),
                AnyDemo(AuthTokenRefreshDemo.self),
                AnyDemo(OAuthJWTDemo.self),
                AnyDemo(RetryCircuitBreakerDemo.self),
                AnyDemo(BackgroundTasksDemo.self),
                AnyDemo(NetworkStackPinningDemo.self),
            ]
        case .persistence:
            return [
                AnyDemo(UserDefaultsDemo.self),
                AnyDemo(KeychainDemo.self),
                AnyDemo(FileManagerDemo.self),
                AnyDemo(CoreDataDemo.self),
                AnyDemo(SwiftDataDemo.self),
                AnyDemo(CoreDataMigrationDemo.self),
                AnyDemo(MemoryDiskCacheDemo.self),
                AnyDemo(CacheStrategyDemo.self),
                AnyDemo(PersistencePerformanceDemo.self),
                AnyDemo(StorageSelectionDemo.self),
            ]
        case .testing:
            return [
                AnyDemo(XCTestDemo.self),
                AnyDemo(SwiftTestingDemo.self),
                AnyDemo(MockingDemo.self),
                AnyDemo(SnapshotUITestDemo.self),
                AnyDemo(TestStrategyDemo.self),
            ]
        case .performance:
            return [
                AnyDemo(InstrumentsDemo.self),
                AnyDemo(ImageScrollDemo.self),
                AnyDemo(LaunchTimeDemo.self),
                AnyDemo(MainThreadHitchDemo.self),
                AnyDemo(MetricKitDemo.self),
                AnyDemo(RenderingBudgetDemo.self),
            ]
        case .buildSystem:
            return [
                AnyDemo(XcodeBuildDemo.self),
                AnyDemo(BuildTimeOptDemo.self),
                AnyDemo(CICDDemo.self),
                AnyDemo(CodeSigningDemo.self),
                AnyDemo(SPMDemo.self),
                AnyDemo(StaticVsDynamicDemo.self),
                AnyDemo(FrameworkVsLibraryDemo.self),
                AnyDemo(LinkerDyldDemo.self),
                AnyDemo(MachODemo.self),
            ]
        case .designPatterns:
            return [
                AnyDemo(DelegateDemo.self),
                AnyDemo(ObserverDemo.self),
                AnyDemo(SingletonDemo.self),
                AnyDemo(FactoryStrategyBuilderDemo.self),
                AnyDemo(CompositionOverInheritanceDemo.self),
                AnyDemo(SwiftIdiomaticDemo.self),
            ]
        case .csFundamentals:
            return [
                AnyDemo(AlgorithmComplexityDemo.self),
                AnyDemo(DataStructuresDemo.self),
                AnyDemo(ConcurrencyPrimitivesDemo.self),
                AnyDemo(MemoryModelDemo.self),
                AnyDemo(ProcessVsThreadDemo.self),
                AnyDemo(SystemDesignIntroDemo.self),
            ]
        case .network:
            return [
                AnyDemo(OSITCPIPDemo.self),
                AnyDemo(HTTPBasicsDemo.self),
                AnyDemo(HTTP23Demo.self),
                AnyDemo(HTTPSTLSDemo.self),
                AnyDemo(TLSHandshakeDemo.self),
                AnyDemo(DNSCachingDemo.self),
                AnyDemo(TCPvsUDPDemo.self),
                AnyDemo(RESTAPIDemo.self),
                AnyDemo(WebSocketDemo.self),
            ]
        case .paradigms:
            return [
                AnyDemo(OOPDemo.self),
                AnyDemo(FPDemo.self),
                AnyDemo(ImperativeVsDeclarativeDemo.self),
                AnyDemo(OOPvsFPDemo.self),
            ]
        case .realWorld:
            return [
                AnyDemo(AccessibilityDemo.self),
                AnyDemo(DeepLinkingDemo.self),
                AnyDemo(FCMDemo.self),
                AnyDemo(FeatureFlagDemo.self),
                AnyDemo(LocalizationDemo.self),
                AnyDemo(PushNotificationDemo.self),
            ]
        case .objectiveC:
            return [
                AnyDemo(ObjCARCMRCDemo.self),
                AnyDemo(ObjCAutoreleasepoolDemo.self),
                AnyDemo(ObjCBlocksDemo.self),
                AnyDemo(ObjCCategoriesDemo.self),
                AnyDemo(ObjCKVOKVCDemo.self),
                AnyDemo(ObjCMethodDispatchDemo.self),
                AnyDemo(ObjCOwnershipDemo.self),
                AnyDemo(ObjCPropertiesDemo.self),
                AnyDemo(ObjCProtocolsDemo.self),
                AnyDemo(ObjCRuntimeDemo.self),
                AnyDemo(ObjCSwiftInteropDemo.self),
            ]
        }
    }
}
